"use client";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { Box } from "@mui/material";
export default function BottomNavBar() {
  const navItems = [
    { name: "遊戲", href: "/", icon: <VideogameAssetIcon /> },
    { name: "排行", href: "/dashboard", icon: <FormatListNumberedIcon /> },
    { name: "影片", href: "/videos", icon: <SlideshowIcon /> },
  ];
  const pathname = usePathname();
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-black border-t flex justify-around text-sm`}
    >
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex flex-col items-center py-2`}
          style={{
            color: pathname === item.href ? "#cac0ff" : "white",
          }}
        >
          <Box className={`text-2xl`}>{item.icon}</Box>
          <Box>{item.name}</Box>
        </Link>
      ))}
    </nav>
  );
}
