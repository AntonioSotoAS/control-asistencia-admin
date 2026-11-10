import { baseApi } from "@/shared/services/baseApi";
import type { Faq, CrearFaqPayload, ActualizarFaqPayload } from "../types/faq.types";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function extractKeywords(pregunta: string, existingClaves?: string[]): string[] {
  if (existingClaves && existingClaves.length > 0) {
    return existingClaves;
  }
  const words = pregunta
    .toLowerCase()
    .replace(/[¿?.,;:!¡()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 5);

  return words.length > 0 ? words : ["consulta", "asistencia"];
}

export const faqsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<Faq[], void>({
      query: () => "/faqs",
      transformResponse: (response: unknown): Faq[] => {
        if (Array.isArray(response)) {
          return response as Faq[];
        }
        if (response && typeof response === "object" && "data" in response) {
          const d = (response as { data: unknown }).data;
          if (Array.isArray(d)) {
            return d as Faq[];
          }
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Faq" as const, id })),
              { type: "Faq", id: "LIST" },
            ]
          : [{ type: "Faq", id: "LIST" }],
    }),

    crearFaq: builder.mutation<Faq, CrearFaqPayload>({
      query: (body) => {
        const slug = body.slug?.trim() ? generateSlug(body.slug) : generateSlug(body.pregunta);
        const claves = extractKeywords(body.pregunta, body.claves);

        return {
          url: "/faqs",
          method: "POST",
          body: {
            ...body,
            slug,
            claves,
          },
        };
      },
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),

    actualizarFaq: builder.mutation<Faq, ActualizarFaqPayload>({
      query: ({ id, ...body }) => {
        const payload: Record<string, unknown> = { ...body };
        if (body.slug?.trim()) {
          payload.slug = generateSlug(body.slug);
        } else if (body.pregunta && body.slug === "") {
          payload.slug = generateSlug(body.pregunta);
        }
        if (body.pregunta && (!body.claves || body.claves.length === 0)) {
          payload.claves = extractKeywords(body.pregunta, body.claves);
        }

        return {
          url: `/faqs/${id}`,
          method: "PUT",
          body: payload,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Faq", id },
        { type: "Faq", id: "LIST" },
      ],
    }),

    eliminarFaq: builder.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCrearFaqMutation,
  useActualizarFaqMutation,
  useEliminarFaqMutation,
} = faqsApi;

