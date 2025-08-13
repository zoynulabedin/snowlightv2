import { Link } from "@remix-run/react";
import React, { useMemo } from "react";

type albumfunctionProps = {
  title: string;
  id: string;
};
function getRandomBgColor() {
  const colors = [
    "bg-red-100 border-red-500 text-red-700",
    "bg-green-100 border-green-500 text-green-700",
    "bg-blue-100 border-blue-500 text-blue-700",
    "bg-yellow-100 border-yellow-500 text-yellow-700",
    "bg-purple-100 border-purple-500 text-purple-700",
    "bg-pink-100 border-pink-500 text-pink-700",
    "bg-indigo-100 border-indigo-500 text-indigo-700",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function AlbumFunction({ title, id }: albumfunctionProps) {
  const colorClass = useMemo(() => getRandomBgColor(), []);
  return (
    <div className="space-y-1">
      <div className={`${colorClass} border-l-4 p-2`}>
        <Link to={`/album/${id}`} className="font-medium text-sm">
          {title}
        </Link>
      </div>
    </div>
  );
}
