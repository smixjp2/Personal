'use client';

import { useData } from "@/contexts/data-context";
import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectPage() {
    const params = useParams();
    const { id } = params;
    const { projects, isInitialized } = useData();

    const project = isInitialized ? projects.find(p => p.id === id) : null;

    if (!isInitialized) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-3 gap-4 pt-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }
    
    if (!project) {
        return <div className="text-center py-10">Projet non trouvé.</div>;
    }

    return <ProjectDetail project={project} />;
}
