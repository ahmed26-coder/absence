declare module "pdfmake/build/pdfmake" {
  type CreatePdf = (definition: unknown) => {
    download: (fileName?: string) => void
  }

  const pdfMake: {
    vfs?: Record<string, string>
    fonts?: unknown
    createPdf: CreatePdf
  }

  export default pdfMake
}

declare module "pdfmake/build/vfs_fonts" {
  const pdfFonts: {
    pdfMake?: { vfs?: Record<string, string> }
    vfs?: Record<string, string>
  }

  export default pdfFonts
}
