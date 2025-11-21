// src/components/base/ServiceCard.tsx
type ServiceCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function ServiceCard({ title, description, icon }: ServiceCardProps) {

  return (
    <div className="feature-card group">
      <div className="text-blue-600 text-4xl mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl text-slate-800 font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
