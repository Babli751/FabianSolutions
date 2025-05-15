 // services/ProjectService.ts
import projectsData from "@/../public/data/projects.json";
import { Project } from "@/types/projects";


const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`/data/projects.json`);
    if (!response.ok) {
      throw new Error("Failed to fetch Project data");
    }
    const data = await response.json();
    return Object.values(data.Projects);
  } catch (error) {
    console.error("Error fetching Blogs:", error);
    throw error;
  }
};


const fetchProjectDetails = async (slug: string, locale: string): Promise<Project | null> => {
  try {
    const projects: Project[] = Object.values(projectsData.Projects || {});
    const projectData = projects.find((b: Project) => b.slug === slug);

    if (!projectData) return null;


    console.log(locale)

    const project: Project = {
      id: projectData.id,
      slug: projectData.slug,
      cover: projectData.cover,
      translations: projectData.translations,
      tags: projectData.tags,
      published_at: projectData.published_at || new Date().toISOString(),
    };

    return project;
  } catch (error) {
    console.error("Error fetching Project by slug:", error);
    return null;
  }
};

  export {fetchProjects};
  export {fetchProjectDetails};