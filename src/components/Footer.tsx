import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { getLocations } from "@/lib/queries";
import { getGoogleMapsPlaceUrl } from "@/lib/utils";

export async function Footer() {
  const locations = await getLocations();

  return (
    <footer className="mt-auto bg-brand-light px-4 pb-8 pt-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link href="/" className="inline-block">
                <Image
                  src="/logo.png"
                  alt="Buzz Thru Car Wash"
                  width={645}
                  height={387}
                  className="h-10 w-auto object-contain sm:h-12"
                />
              </Link>
              <p className="mt-3 text-sm text-slate-600">{BUSINESS.tagline}</p>
            </div>

            <div>
              <h4 className="font-semibold text-brand-navy">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/services"
                    className="text-slate-600 transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/locations"
                    className="text-slate-600 transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    Locations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/book"
                    className="text-slate-600 transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    Book Hand Wash
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fleet"
                    className="text-slate-600 transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    Fleet
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-600 transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    Contact & FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-navy">Contact</h4>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-brand-blue" />
                  <a
                    href={`tel:${BUSINESS.phone.replace(/\D/g, "")}`}
                    className="transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    {BUSINESS.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-brand-blue" />
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="transition-opacity hover:text-brand-navy hover:opacity-80"
                  >
                    {BUSINESS.email}
                  </a>
                </li>
              </ul>
              <div className="mt-4">
                <p className="font-semibold text-brand-navy">Locations</p>
                <ul className="mt-2 space-y-2">
                  {locations.map((location) => (
                    <li key={location.id}>
                      <a
                        href={getGoogleMapsPlaceUrl(location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 text-sm text-slate-600 transition-colors hover:text-brand-navy"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                        <span>
                          <span className="font-medium text-brand-navy group-hover:underline">
                            {location.name.replace(/^Buzz Thru - /, "")}
                          </span>
                          <br />
                          {location.address}, {location.city}, {location.state}{" "}
                          {location.zip}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-blue-100 pt-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
