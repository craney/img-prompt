"use client";

import React from "react";
import Link from "next/link";

import * as Icons from "@saasfly/ui/icons";
import { DocumentGuide } from "~/components/document-guide";
import { MobileNav } from "~/components/mobile-nav";

import type { MainNavItem } from "~/types";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  params: {
    lang: string;
  };
  marketing?: Record<string, string | object>;
}

export function MainNav({ items, children, params: { lang }, marketing }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const toggleMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  const handleMenuItemClick = () => {
    toggleMenu();
  };
  return (
    <div className="flex gap-6 md:gap-10">
      <div className="flex items-center">
        <Link href={`/${lang}`} className="hidden items-center space-x-3 md:flex group">
          {/* 紫色图标背景 */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200">
            <Icons.Image className="w-6 h-6 text-white" />
          </div>
          {/* 品牌名称 */}
          <div className="text-2xl font-bold text-foreground group-hover:text-purple-600 transition-colors duration-200">ImgPrompt.He</div>
        </Link>

        {/* 移动端品牌显示 */}
        <Link href={`/${lang}`} className="flex items-center space-x-2 md:hidden group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
            <Icons.Image className="w-5 h-5 text-white" />
          </div>
          <div className="text-xl font-bold text-foreground">ImgPrompt.He</div>
        </Link>
      </div>

      <button
        className="flex items-center space-x-2 md:hidden ml-auto"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? <Icons.Close className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
        <span className="font-medium">Menu</span>
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items} menuItemClick={handleMenuItemClick}>
          {children}
        </MobileNav>
      )}
    </div>
  );
}
