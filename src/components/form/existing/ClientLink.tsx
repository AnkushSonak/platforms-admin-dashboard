"use client";
import Link, { LinkProps } from "next/link";
import React, { ReactNode } from "react";
import { useLoading } from "@/context/LoadingContext";

type ClientLinkProps = LinkProps & {
  onClick?: React.MouseEventHandler;
  children: ReactNode;
  className?: string;
  role?: string;
  tabIndex?: number;
  [key: string]: any;
};

export default function ClientLink({ onClick, children, ...props }: ClientLinkProps) {
  const { setLoading } = useLoading();
  return (
    <Link
      {...props}
      onClick={e => {
        setLoading(true);
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
