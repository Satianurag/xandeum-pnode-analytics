"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bullet } from "@/components/ui/bullet";
import { cn } from "@/lib/utils";

interface StatBlockProps {
    label: string;
    value: string | number;
    description?: string;
    icon?: React.ElementType;
    variant?: "default" | "primary" | "success" | "warning" | "error";
}

export default function StatBlock({
    label,
    value,
    description,
    icon: Icon,
    variant = "default",
}: StatBlockProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case "primary":
                return "border-primary/50";
            case "success":
                return "border-green-500/30";
            case "warning":
                return "border-yellow-500/30";
            case "error":
                return "border-red-500/30";
            default:
                return "";
        }
    };

    const getValueColor = () => {
        switch (variant) {
            case "primary":
                return "text-primary";
            case "success":
                return "text-green-400";
            case "warning":
                return "text-yellow-400";
            case "error":
                return "text-red-400";
            default:
                return "";
        }
    };

    const getBulletVariant = () => {
        switch (variant) {
            case "success":
                return "success";
            case "warning":
                return "warning";
            case "error":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <Card className={cn("relative overflow-hidden", getVariantStyles())}>
            <CardHeader className="flex items-center justify-between py-2 px-3">
                <CardTitle className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Bullet variant={getBulletVariant()} />
                    {label}
                </CardTitle>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
            </CardHeader>

            <CardContent className="bg-accent flex-1 pt-2 pb-3 px-3 overflow-clip relative">
                <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl md:text-4xl font-display", getValueColor())}>
                        {value}
                    </span>
                </div>

                {description && (
                    <p className="text-xs font-medium text-muted-foreground tracking-wide mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
