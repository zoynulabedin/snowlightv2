// NavItem.jsx
import { Link } from "@remix-run/react";

type NavItemProps = {
  title: string;
  id: string | number;
};

export default function NavItem({ title, id }: NavItemProps) {
  return (
    <Link
      to={`/album/${id}`}
      className="text-gray-700 hover:text-gray-900 font-medium"
    >
      {title}
    </Link>
  );
}
