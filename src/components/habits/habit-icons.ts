import {
    BookOpen,
    Dumbbell,
    Heart,
    Leaf,
    PenTool,
    Repeat,
    TrendingUp,
    Wind,
} from "lucide-react";

export const iconMap = {
    Wind,
    Dumbbell,
    BookOpen,
    Leaf,
    Repeat,
    PenTool,
    TrendingUp,
    Heart,
};

export type IconName = keyof typeof iconMap;

export const iconNames = Object.keys(iconMap) as IconName[];
