export function toJobDTO(input) {
    return {
      source: input.source,
      title: input.title,
      company: input.company,
      location: input.location || null,
      applyUrl: input.applyUrl,
      salary: input.salary || null,
      tags: input.tags || [],
      founders: input.founders || [],
      companyDescription: input.companyDescription || null,
      ycSlug: input.ycSlug || null,
      scrapedAt: new Date()
    };
  }
  