import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function ContactPage() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-white px-6 py-20 max-w-4xl mx-auto dark:bg-gray-900">
      <h1 className="text-4xl font-semibold text-gray-900 mb-16 dark:text-gray-200">Get in Touch</h1>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 text-gray-700">

        {/* Email */}
        <ContactCard icon={<FaEnvelope />} label="Email" value="hello@yourdomain.com" href="mailto:hello@yourdomain.com" />

        {/* Phone */}
        <ContactCard icon={<FaPhone />} label="Phone" value="+1 (234) 567-890" href="tel:+1234567890" />

        {/* Address */}
        <ContactCard icon={<FaMapMarkerAlt />} label="Address" value="1234 Web St, Tech City, USA" />

        {/* Socials */}
        <div className="flex flex-col space-y-4 sm:col-span-2">
          <p className="font-semibold text-gray-900 mb-2 dark:text-gray-200">Follow Us</p>
          <div className="flex space-x-6 text-gray-600 text-2xl">
            <SocialIcon href="https://twitter.com/yourprofile" ariaLabel="Twitter"><FaTwitter /></SocialIcon>
            <SocialIcon href="https://linkedin.com/in/yourprofile" ariaLabel="LinkedIn"><FaLinkedin /></SocialIcon>
            <SocialIcon href="https://github.com/yourprofile" ariaLabel="GitHub"><FaGithub /></SocialIcon>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center space-x-4 border-b border-gray-200 pb-4 last:border-none">
      <div className="text-indigo-600 text-3xl">{icon}</div>
      <div>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {href ? (
          <a href={href} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition dark:text-gray-400">
            {value}
          </a>
        ) : (
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-400">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ href, ariaLabel, children }: { href: string; ariaLabel: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-indigo-600 transition dark:text-gray-200"
    >
      {children}
    </a>
  );
}
