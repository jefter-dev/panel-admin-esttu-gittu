"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number | string;
  color?: string;
  prefix?: string;
  onClick?: () => void;
};

export function StatCard({
  title,
  value,
  color = "text-primary",
  prefix,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      onClick={onClick}
      className={`w-full ${onClick ? "cursor-pointer" : ""}`}
    >
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${color}`}>
            {prefix ? `${prefix} ${value}` : value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
