import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/lib/db";
import { validateSession } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return redirect("/login");
    }

    const user = await validateSession(token);
    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      return redirect("/login");
    }

    // Fetch all users with their roles and stats
    const users = await db.user.findMany({
      include: {
        uploadedSongs: {
          select: {
            id: true,
            title: true,
          },
        },
        favorites: {
          select: {
            id: true,
          },
        },
        artistProfile: {
          select: {
            id: true,
            name: true,
            stageName: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { currentUser: user, users };
  } catch (error) {
    console.error("User management loader error:", error);
    return redirect("/login");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return { error: "Unauthorized" };
    }

    const user = await validateSession(token);
    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      return { error: "Unauthorized" };
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    switch (intent) {
      case "update-role": {
        const userId = formData.get("userId") as string;
        const newRole = formData.get("role") as string;

        if (!userId || !newRole) {
          return { error: "User ID and role are required" };
        }

        // Prevent changing own role unless SUPER_ADMIN
        if (userId === user.id && user.role !== "SUPER_ADMIN") {
          return { error: "You cannot change your own role" };
        }

        const validRoles = [
          "USER",
          "ARTIST",
          "MODERATOR",
          "ADMIN",
          "SUPER_ADMIN",
        ];
        if (!validRoles.includes(newRole)) {
          return { error: "Invalid role" };
        }

        // Only SUPER_ADMIN can create other SUPER_ADMINs
        if (newRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
          return { error: "Only Super Admins can assign Super Admin role" };
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: newRole,
            isAdmin: ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(newRole),
          },
        });

        return { success: "User role updated successfully" };
      }

      case "delete-user": {
        const userId = formData.get("userId") as string;
        if (!userId) {
          return { error: "User ID is required" };
        }

        // Prevent deleting own account
        if (userId === user.id) {
          return { error: "You cannot delete your own account" };
        }

        // Only SUPER_ADMIN can delete other admins
        const targetUser = await db.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (
          targetUser &&
          ["ADMIN", "SUPER_ADMIN"].includes(targetUser.role) &&
          user.role !== "SUPER_ADMIN"
        ) {
          return { error: "Only Super Admins can delete admin accounts" };
        }

        await db.user.delete({
          where: { id: userId },
        });

        return { success: "User deleted successfully" };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("User management action error:", error);
    return { error: "Failed to process request" };
  }
}

export default function UserRoleManagement() {
  const { currentUser, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MODERATOR":
        return "bg-orange-100 text-orange-800";
      case "ARTIST":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User & Role Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ARTIST">Artist</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || user.username}
                            {user.id === currentUser.id && (
                              <span className="ml-2 text-xs text-blue-600">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.artistProfile && (
                            <div className="text-xs text-blue-600">
                              Artist:{" "}
                              {user.artistProfile.stageName ||
                                user.artistProfile.name}
                              {user.artistProfile.isVerified && " ✓"}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Form method="post" className="inline">
                        <input
                          type="hidden"
                          name="intent"
                          value="update-role"
                        />
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          onChange={(e) => {
                            const form = e.target.closest(
                              "form"
                            ) as HTMLFormElement;
                            form.requestSubmit();
                          }}
                          disabled={
                            user.id === currentUser.id &&
                            currentUser.role !== "SUPER_ADMIN"
                          }
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${getRoleBadgeColor(
                            user.role
                          )} disabled:opacity-50`}
                        >
                          <option value="USER">User</option>
                          <option value="ARTIST">Artist</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="ADMIN">Admin</option>
                          {currentUser.role === "SUPER_ADMIN" && (
                            <option value="SUPER_ADMIN">Super Admin</option>
                          )}
                        </select>
                      </Form>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Songs: {user.uploadedSongs.length}</div>
                      <div>Favorites: {user.favorites.length}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Form method="post" className="inline">
                        <input
                          type="hidden"
                          name="intent"
                          value="delete-user"
                        />
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          disabled={user.id === currentUser.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={(e) => {
                            if (
                              !confirm(
                                `Are you sure you want to delete user "${user.username}"?`
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {["USER", "ARTIST", "MODERATOR", "ADMIN", "SUPER_ADMIN"].map(
            (role) => {
              const count = users.filter((user) => user.role === role).length;
              return (
                <div
                  key={role}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${getRoleBadgeColor(
                            role
                          )}`}
                        >
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {role.replace("_", " ")}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {count} {count === 1 ? "user" : "users"}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Action Messages */}
        {actionData?.error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {actionData.error}
          </div>
        )}
        {actionData?.success && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {actionData.success}
          </div>
        )}
      </div>
    </div>
  );
}
