import {
    BookOpen, Dumbbell, Heart, Leaf, PenTool, Repeat, TrendingUp, Wind,
    Smile, Bed, Wallet, Droplets, Sun, Moon, Apple, Users, Code, Brain, Brush, Flower
} from "lucide-react";

export const iconMap = {
    Wind,
    Dumbbell,
    BookOpen,
    Leaf,
    Apple,
    Droplets,
    Bed,
    Sun,
    Moon,
    Heart,
    Smile,
    Wallet,
    TrendingUp,
    Brain,
    Code,
    Brush,
    Flower,
    Users,
    Repeat,
    PenTool,
};

export type IconName = keyof typeof iconMap;

export const iconNames = Object.keys(iconMap) as IconName[];
