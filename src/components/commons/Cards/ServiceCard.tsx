// src/components/base/ServiceCard.tsx
type ServiceCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function ServiceCard({ title, description, icon }: ServiceCardProps) {

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
      <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4 bg-gray-100 dark:bg-gray-700 w-14 h-14 mx-auto rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl text-gray-900 dark:text-gray-100 font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
