import {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_DESCRIPTION,
  SOCIAL_LINKS,
} from "@/lib/site"
import type { Course } from "@/lib/types"

/**
 * schema.org EducationalOrganization for the home page. Targets Egypt first
 * (addressCountry EG) while declaring worldwide reach (areaServed).
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [SITE_NAME_EN, "Ta'seel Academy", "تأصيل"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/opengraph-image`,
    description: SITE_DESCRIPTION,
    slogan: "أصالة المنهج وعصرية الوسيلة",
    email: undefined,
    inLanguage: ["ar", "en"],
    knowsLanguage: ["ar", "en"],
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressRegion: "مصر",
    },
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "Place", name: "Worldwide" },
    ],
    ...(SOCIAL_LINKS.length ? { sameAs: SOCIAL_LINKS } : {}),
  }
}

/** schema.org WebSite entity (helps Google associate the domain with the brand). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "ar-EG",
    publisher: { "@id": `${SITE_URL}/#organization` },
  }
}

/** BreadcrumbList for a page. Pass ordered [name, path] pairs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

/** ItemList of Course entities for the featured courses on the landing page. */
export function coursesItemListJsonLd(courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.name,
        inLanguage: "ar",
        provider: {
          "@type": "EducationalOrganization",
          name: SITE_NAME,
          "@id": `${SITE_URL}/#organization`,
        },
      },
    })),
  }
}

/** schema.org Person for the academy's supervising scholar. */
export function personJsonLd(params: {
  name: string
  jobTitle: string
  description: string
  path: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    jobTitle: params.jobTitle,
    description: params.description,
    url: `${SITE_URL}${params.path}`,
    worksFor: { "@id": `${SITE_URL}/#organization` },
  }
}

/** Serialize JSON-LD safely for a <script> tag (escape closing tags). */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
