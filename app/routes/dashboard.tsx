import { LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";

import { validateSession } from "~/lib/auth";

import DashboardSidebar from "~/components/DashboardSidebar";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return redirect("/login");
    }

    // Validate session
    const user = await validateSession(token);
    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      console.log("User not authorized:", {
        isAdmin: user?.isAdmin,
        role: user?.role,
      });
      return redirect("/login");
    }

    return json({
      user,
    });
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return redirect("/login");
  }
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex relative bg-gray-50  overflow-hidden">
      {/* Sidebar */}
      <div
        className={`sticky top-20 transition-all duration-300 ${
          !sidebarOpen ? "w-64" : "w-0"
        }`}
      >
        <DashboardSidebar sidebarOpen={sidebarOpen} user={data.user} />
        <button
          className={`absolute top-20 z-[9999] left-[100%] py-5 border border-l-0 bg-slate-200 transition-all duration-300 hover:w-[4.5rem] w-8 rounded-tr-md rounded-br-md group md:block sm:block hidden cursor-pointer`}
          id="gnbHandleBtn"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <div className="flex items-center gap-1 justify-center">
            <ChevronRight className="w-5 h-5" />
            <span className="transition-all duration-500 ease-in-out whitespace-nowrap hidden group-hover:block">
              MENU
            </span>
          </div>
        </button>
      </div>
      {/* Main Content Area */}
      <div
        className={`flex-1  flex flex-col transition-all duration-300 ${
          !sidebarOpen ? "max-w-[calc(100%-16rem)]" : "max-w-[100%]"
        }`}
      >
        <main className="flex-1 p-6 overflow-y-auto max-h-screen ">
          <Outlet />
          <footer className="bg-white border-t  mt-auto">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  © 2024 Music Platform. All rights reserved.
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Admin: {data.user.username}</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
