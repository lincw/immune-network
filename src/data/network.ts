import type { NetworkData, NetworkNode, NetworkEdge } from "../types";

// ---------------------------------------------------------------------------
// Curated immune-system network.
//
// A hand-built knowledge graph covering the scope of the PeproTech
// "Immunologic networks" poster: humoral and cellular immunity, the T-helper
// differentiation tree, B-cell / antibody axis, innate effectors, the
// cytokines and transcription factors that wire them together, and the
// functional outcomes they produce.
//
// Relationships reflect standard immunology rather than a pixel-for-pixel
// tracing of the poster, so the graph is internally consistent and easy to
// extend: add an entry here and it appears in search, the graph, and the
// info panel automatically. The data-integrity test guards referential
// correctness.
// ---------------------------------------------------------------------------

const nodes: NetworkNode[] = [
  // ===================== CELLS =====================
  {
    id: "naive-cd4",
    label: "Naïve CD4⁺ T cell",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["naive cd4", "th0", "helper t cell precursor", "cd4 t cell"],
    description:
      "Antigen-inexperienced helper T cell. Depending on the cytokine milieu at priming by an antigen-presenting cell, it differentiates into one of several T-helper lineages.",
  },
  {
    id: "naive-cd8",
    label: "Naïve CD8⁺ T cell",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["naive cd8", "cytotoxic t cell precursor"],
    description:
      "Antigen-inexperienced cytotoxic T cell. On recognition of peptide–MHC-I plus help, it differentiates into an effector cytotoxic T lymphocyte (CTL).",
  },
  {
    id: "th1",
    label: "Th1",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["t helper 1", "type 1 helper"],
    description:
      "Pro-inflammatory helper subset driving cell-mediated immunity against intracellular pathogens. Master regulator T-bet; signature cytokine IFN-γ.",
  },
  {
    id: "th2",
    label: "Th2",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["t helper 2", "type 2 helper"],
    description:
      "Helper subset orchestrating humoral and anti-parasite/allergic responses. Master regulator GATA3; signature cytokines IL-4, IL-5, IL-13.",
  },
  {
    id: "th9",
    label: "Th9",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["t helper 9"],
    description:
      "IL-9–producing helper subset induced by TGF-β plus IL-4. Promotes mast-cell growth and contributes to allergic inflammation and anti-parasite immunity.",
  },
  {
    id: "th17",
    label: "Th17",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["t helper 17"],
    description:
      "Helper subset defending against extracellular bacteria and fungi and implicated in autoimmunity. Master regulator RORγt; signature cytokines IL-17A/F, IL-22.",
  },
  {
    id: "th22",
    label: "Th22",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["t helper 22"],
    description:
      "IL-22–producing helper subset acting mainly on epithelial barriers (skin, gut), promoting antimicrobial defense and tissue repair.",
  },
  {
    id: "tfh",
    label: "Tfh",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["t follicular helper", "follicular helper t cell"],
    description:
      "Follicular helper T cell that resides in B-cell follicles (CXCR5⁺) and provides CD40L and IL-21 help to germinal-center B cells. Master regulator Bcl6.",
  },
  {
    id: "treg",
    label: "Treg",
    category: "cell",
    subsystem: "shared",
    synonyms: ["regulatory t cell", "t regulatory", "suppressor t cell"],
    description:
      "Regulatory T cell that enforces tolerance and dampens immune responses. Master regulator FOXP3; acts via IL-10, TGF-β, and contact-dependent suppression.",
  },
  {
    id: "itreg",
    label: "iTreg",
    category: "cell",
    subsystem: "shared",
    synonyms: ["induced treg", "peripherally induced regulatory t cell"],
    description:
      "Regulatory T cell induced in the periphery from naïve CD4⁺ T cells by TGF-β and IL-2. FOXP3⁺ and suppressive like its thymic counterpart.",
  },
  {
    id: "ntreg",
    label: "nTreg",
    category: "cell",
    subsystem: "shared",
    synonyms: ["natural treg", "thymic regulatory t cell"],
    description:
      "Naturally occurring (thymus-derived) FOXP3⁺ regulatory T cell that maintains self-tolerance from the outset.",
  },
  {
    id: "th3",
    label: "Th3",
    category: "cell",
    subsystem: "shared",
    synonyms: ["t helper 3"],
    description:
      "TGF-β–secreting regulatory helper subset associated with oral tolerance and mucosal IgA responses.",
  },
  {
    id: "ctl",
    label: "CD8⁺ CTL",
    category: "cell",
    subsystem: "cellular",
    synonyms: ["cytotoxic t lymphocyte", "killer t cell", "effector cd8", "cd8 t cell"],
    description:
      "Effector cytotoxic T lymphocyte that kills infected or transformed cells displaying antigen on MHC-I, using perforin/granzymes and Fas/FasL.",
  },
  {
    id: "naive-b",
    label: "Naïve B cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["b cell", "b lymphocyte", "resting b cell"],
    description:
      "Mature antigen-inexperienced B cell expressing surface IgM/IgD (BCR). Becomes activated on antigen encounter plus T-cell help.",
  },
  {
    id: "activated-b",
    label: "Activated B cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["activated b lymphocyte"],
    description:
      "B cell that has engaged antigen via its BCR and received CD40L/cytokine help, leading to proliferation, class switching, and germinal-center entry.",
  },
  {
    id: "gc-b",
    label: "Germinal center B cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["gc b cell", "germinal centre b cell"],
    description:
      "B cell undergoing somatic hypermutation and affinity-based selection within the germinal center, helped by Tfh cells and follicular dendritic cells.",
  },
  {
    id: "plasmablast",
    label: "Plasmablast",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["plasma blast"],
    description:
      "Proliferating antibody-secreting precursor that bridges activated B cells and long-lived plasma cells.",
  },
  {
    id: "plasma",
    label: "Plasma cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["plasma b cell", "antibody secreting cell", "asc"],
    description:
      "Terminally differentiated, antibody-factory B cell. Driven by BLIMP1/IRF4; secretes large amounts of a single antibody isotype.",
  },
  {
    id: "memory-b",
    label: "Memory B cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["b memory cell"],
    description:
      "Long-lived B cell from the germinal-center reaction that mounts a rapid, high-affinity antibody response on antigen re-exposure.",
  },
  {
    id: "follicular-b",
    label: "Follicular B cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["fo b cell"],
    description:
      "Recirculating B-cell subset that populates lymphoid follicles and participates in T-dependent germinal-center responses.",
  },
  {
    id: "dc",
    label: "Dendritic cell",
    category: "cell",
    subsystem: "innate",
    synonyms: ["dc", "antigen presenting cell", "apc"],
    description:
      "Professional antigen-presenting cell that bridges innate and adaptive immunity, priming naïve T cells and shaping their differentiation via cytokines.",
  },
  {
    id: "fdc",
    label: "Follicular dendritic cell",
    category: "cell",
    subsystem: "humoral",
    synonyms: ["fdc"],
    description:
      "Stromal cell of B-cell follicles that retains antigen–antibody complexes and secretes CXCL13 to organize the germinal center and select high-affinity B cells.",
  },
  {
    id: "macrophage",
    label: "Macrophage",
    category: "cell",
    subsystem: "innate",
    synonyms: ["mphage", "mononuclear phagocyte"],
    description:
      "Phagocytic innate cell and antigen-presenting cell. Activated by IFN-γ to kill intracellular pathogens and to secrete inflammatory cytokines.",
  },
  {
    id: "monocyte",
    label: "Monocyte",
    category: "cell",
    subsystem: "innate",
    synonyms: ["blood monocyte"],
    description:
      "Circulating myeloid precursor recruited to tissues where it differentiates into macrophages or dendritic cells during inflammation.",
  },
  {
    id: "nk",
    label: "NK cell",
    category: "cell",
    subsystem: "innate",
    synonyms: ["natural killer cell"],
    description:
      "Innate lymphocyte that kills stressed, virus-infected, or transformed cells lacking MHC-I, and performs antibody-dependent cellular cytotoxicity. Secretes IFN-γ.",
  },
  {
    id: "neutrophil",
    label: "Neutrophil",
    category: "cell",
    subsystem: "innate",
    synonyms: ["pmn", "polymorphonuclear leukocyte"],
    description:
      "Short-lived phagocytic granulocyte, the first responder to bacterial and fungal infection. Recruited by IL-8 and IL-17.",
  },
  {
    id: "eosinophil",
    label: "Eosinophil",
    category: "cell",
    subsystem: "innate",
    synonyms: ["eosinophilic granulocyte"],
    description:
      "Granulocyte specialized against helminths and involved in allergic inflammation. Survival and recruitment depend on IL-5 and eotaxins.",
  },
  {
    id: "basophil",
    label: "Basophil",
    category: "cell",
    subsystem: "innate",
    synonyms: ["basophilic granulocyte"],
    description:
      "Circulating granulocyte that releases histamine and Th2-promoting cytokines (IL-4) during allergic and anti-parasite responses.",
  },
  {
    id: "mast",
    label: "Mast cell",
    category: "cell",
    subsystem: "innate",
    synonyms: ["mastocyte"],
    description:
      "Tissue-resident granulocyte bearing FcεRI; cross-linking of bound IgE triggers degranulation, driving immediate (Type I) hypersensitivity.",
  },
  {
    id: "epithelial",
    label: "Epithelial cells",
    category: "cell",
    subsystem: "shared",
    synonyms: ["epithelium"],
    description:
      "Barrier cells that sense damage and infection, secreting alarmins (IL-25, IL-33) and chemokines that shape local immunity.",
  },
  {
    id: "endothelial",
    label: "Endothelial cells",
    category: "cell",
    subsystem: "shared",
    synonyms: ["endothelium", "vascular endothelium"],
    description:
      "Blood-vessel lining cells that regulate leukocyte adhesion and extravasation and respond to inflammatory cytokines.",
  },
  {
    id: "fibroblast",
    label: "Fibroblasts",
    category: "cell",
    subsystem: "shared",
    synonyms: ["stromal fibroblast"],
    description:
      "Connective-tissue cells that, when activated by inflammatory cytokines, produce chemokines and matrix remodeling factors.",
  },
  {
    id: "keratinocyte",
    label: "Keratinocytes",
    category: "cell",
    subsystem: "shared",
    synonyms: ["skin epithelial cell"],
    description:
      "Skin epithelial cells; targets of IL-17 and IL-22 that respond with antimicrobial peptides and pro-inflammatory mediators.",
  },
  {
    id: "smooth-muscle",
    label: "Smooth muscle cells",
    category: "cell",
    subsystem: "shared",
    synonyms: ["smooth muscle"],
    description:
      "Airway/vascular contractile cells whose responses to Th2 cytokines contribute to asthma and tissue remodeling.",
  },
  {
    id: "stromal",
    label: "Stromal cells",
    category: "cell",
    subsystem: "shared",
    synonyms: ["stroma"],
    description:
      "Supportive tissue cells that provide cytokines and growth factors shaping hematopoiesis and local immune responses.",
  },

  // ===================== CYTOKINES =====================
  { id: "il1", label: "IL-1", category: "cytokine", subsystem: "innate", synonyms: ["interleukin 1", "il-1β", "il1b"], description: "Pyrogenic pro-inflammatory cytokine from macrophages/DCs driving fever, inflammation, and Th17 polarization." },
  { id: "il2", label: "IL-2", category: "cytokine", subsystem: "shared", synonyms: ["interleukin 2", "t cell growth factor"], description: "T-cell growth factor essential for clonal expansion and, at low doses, for Treg survival." },
  { id: "il3", label: "IL-3", category: "cytokine", subsystem: "shared", synonyms: ["interleukin 3"], description: "Hematopoietic growth factor supporting basophil, mast-cell, and myeloid progenitor development." },
  { id: "il4", label: "IL-4", category: "cytokine", subsystem: "humoral", synonyms: ["interleukin 4"], description: "Signature Th2 cytokine; drives Th2 differentiation (via STAT6/GATA3) and B-cell class switching to IgE and IgG1." },
  { id: "il5", label: "IL-5", category: "cytokine", subsystem: "humoral", synonyms: ["interleukin 5"], description: "Th2 cytokine controlling eosinophil growth, recruitment, and survival." },
  { id: "il6", label: "IL-6", category: "cytokine", subsystem: "shared", synonyms: ["interleukin 6"], description: "Pleiotropic cytokine driving acute-phase responses, Th17/Tfh differentiation (via STAT3), and plasma-cell maturation." },
  { id: "il8", label: "IL-8", category: "cytokine", subsystem: "innate", synonyms: ["interleukin 8", "cxcl8"], description: "Chemokine that recruits and activates neutrophils at sites of inflammation." },
  { id: "il9", label: "IL-9", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 9"], description: "Th9 signature cytokine promoting mast-cell growth, mucus production, and allergic inflammation." },
  { id: "il10", label: "IL-10", category: "cytokine", subsystem: "shared", synonyms: ["interleukin 10"], description: "Anti-inflammatory cytokine from Treg and other cells that suppresses APC activation and effector responses." },
  { id: "il12", label: "IL-12", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 12"], description: "Macrophage/DC cytokine that drives Th1 differentiation (via STAT4) and NK/CTL IFN-γ production." },
  { id: "il13", label: "IL-13", category: "cytokine", subsystem: "humoral", synonyms: ["interleukin 13"], description: "Th2 cytokine acting on epithelium and smooth muscle; mediates mucus production, airway changes, and IgE switching." },
  { id: "il15", label: "IL-15", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 15"], description: "Supports survival and proliferation of NK cells and memory CD8⁺ T cells." },
  { id: "il17", label: "IL-17", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 17", "il-17a", "il-17f"], description: "Th17 signature cytokine that induces chemokines and antimicrobial peptides, recruiting neutrophils to barriers." },
  { id: "il18", label: "IL-18", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 18"], description: "IL-1 family cytokine that synergizes with IL-12 to amplify IFN-γ from NK and Th1 cells." },
  { id: "il21", label: "IL-21", category: "cytokine", subsystem: "humoral", synonyms: ["interleukin 21"], description: "Tfh-derived cytokine essential for germinal-center B-cell help, plasma-cell differentiation, and Th17 support." },
  { id: "il22", label: "IL-22", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 22"], description: "Th17/Th22 cytokine acting on epithelial cells to promote antimicrobial defense, barrier integrity, and repair." },
  { id: "il23", label: "IL-23", category: "cytokine", subsystem: "cellular", synonyms: ["interleukin 23"], description: "Macrophage/DC cytokine that stabilizes and expands pathogenic Th17 cells." },
  { id: "il25", label: "IL-25", category: "cytokine", subsystem: "humoral", synonyms: ["interleukin 25", "il-17e"], description: "Epithelial alarmin that amplifies Th2 responses and type-2 inflammation." },
  { id: "il27", label: "IL-27", category: "cytokine", subsystem: "shared", synonyms: ["interleukin 27"], description: "IL-12 family cytokine with both early Th1-promoting and broader immunoregulatory (IL-10–inducing) effects." },
  { id: "il33", label: "IL-33", category: "cytokine", subsystem: "humoral", synonyms: ["interleukin 33"], description: "Epithelial alarmin released on damage that drives type-2 immunity via mast cells, basophils, and Th2 cells." },
  { id: "ifng", label: "IFN-γ", category: "cytokine", subsystem: "cellular", synonyms: ["interferon gamma", "ifn gamma", "type ii interferon"], description: "Signature Th1/NK/CTL cytokine that activates macrophages, upregulates MHC, and drives IgG2a switching." },
  { id: "ifn1", label: "Type I IFN", category: "cytokine", subsystem: "innate", synonyms: ["interferon alpha", "interferon beta", "ifn-α", "ifn-β", "type i interferon"], description: "Antiviral interferons (IFN-α/β) produced rapidly on infection that induce an antiviral state and enhance cytotoxic responses." },
  { id: "tgfb", label: "TGF-β", category: "cytokine", subsystem: "shared", synonyms: ["transforming growth factor beta", "tgf beta"], description: "Immunoregulatory cytokine essential for iTreg and (with IL-6) Th17 induction, IgA switching, and tissue repair." },
  { id: "tnfa", label: "TNF-α", category: "cytokine", subsystem: "innate", synonyms: ["tumor necrosis factor alpha", "tnf alpha", "cachectin"], description: "Central pro-inflammatory cytokine driving fever, endothelial activation, and the acute inflammatory cascade." },
  { id: "tnfb", label: "TNF-β", category: "cytokine", subsystem: "cellular", synonyms: ["lymphotoxin", "lymphotoxin alpha", "lt-α"], description: "Lymphotoxin secreted by Th1 and other lymphocytes; contributes to cytotoxicity and lymphoid tissue organization." },
  { id: "gmcsf", label: "GM-CSF", category: "cytokine", subsystem: "innate", synonyms: ["granulocyte macrophage colony stimulating factor", "csf2"], description: "Hematopoietic and pro-inflammatory factor promoting myeloid expansion and dendritic-cell/macrophage function." },
  { id: "gcsf", label: "G-CSF", category: "cytokine", subsystem: "innate", synonyms: ["granulocyte colony stimulating factor", "csf3"], description: "Drives neutrophil production and release from the bone marrow during infection." },
  { id: "cxcl13", label: "CXCL13", category: "cytokine", subsystem: "humoral", synonyms: ["bca-1", "b cell chemokine"], description: "Follicular chemokine produced by follicular dendritic cells that recruits CXCR5⁺ B and Tfh cells into follicles." },
  { id: "eotaxin", label: "Eotaxin", category: "cytokine", subsystem: "humoral", synonyms: ["ccl11", "ccl24", "ccl26", "eotaxin-1", "mcp-4"], description: "Chemokine family that recruits eosinophils to sites of allergic and type-2 inflammation." },

  // ===================== TRANSCRIPTION FACTORS =====================
  { id: "tbet", label: "T-bet", category: "transcriptionFactor", subsystem: "cellular", synonyms: ["tbx21", "t box 21"], description: "Master transcription factor of Th1 cells (and cytotoxic programs) that drives IFN-γ expression." },
  { id: "gata3", label: "GATA3", category: "transcriptionFactor", subsystem: "humoral", synonyms: ["gata binding protein 3"], description: "Master transcription factor of Th2 cells controlling the IL-4/IL-5/IL-13 locus." },
  { id: "foxp3", label: "FOXP3", category: "transcriptionFactor", subsystem: "shared", synonyms: ["forkhead box p3", "scurfin"], description: "Lineage-defining transcription factor of regulatory T cells; required for their suppressive function." },
  { id: "rorgt", label: "RORγt", category: "transcriptionFactor", subsystem: "cellular", synonyms: ["rorc", "ror gamma t"], description: "Master transcription factor of Th17 cells driving IL-17 expression." },
  { id: "rora", label: "RORα", category: "transcriptionFactor", subsystem: "cellular", synonyms: ["rora", "ror alpha"], description: "Nuclear receptor cooperating with RORγt to reinforce the Th17 program." },
  { id: "bcl6", label: "Bcl6", category: "transcriptionFactor", subsystem: "humoral", synonyms: ["b cell lymphoma 6"], description: "Master transcription factor of Tfh cells and germinal-center B cells; represses alternative fates." },
  { id: "stat1", label: "STAT1", category: "transcriptionFactor", subsystem: "cellular", synonyms: ["signal transducer and activator of transcription 1"], description: "Signaling transcription factor downstream of IFN-γ/type I IFN that supports Th1 commitment." },
  { id: "stat3", label: "STAT3", category: "transcriptionFactor", subsystem: "shared", synonyms: ["signal transducer and activator of transcription 3"], description: "Transcription factor downstream of IL-6/IL-21/IL-23 central to Th17 and Tfh differentiation." },
  { id: "stat4", label: "STAT4", category: "transcriptionFactor", subsystem: "cellular", synonyms: ["signal transducer and activator of transcription 4"], description: "Transcription factor downstream of IL-12 that promotes Th1 differentiation." },
  { id: "stat6", label: "STAT6", category: "transcriptionFactor", subsystem: "humoral", synonyms: ["signal transducer and activator of transcription 6"], description: "Transcription factor downstream of IL-4 that drives Th2 differentiation and IgE switching." },
  { id: "irf4", label: "IRF4", category: "transcriptionFactor", subsystem: "shared", synonyms: ["interferon regulatory factor 4"], description: "Transcription factor required for Th2/Th9/Th17 programs and for plasma-cell differentiation." },
  { id: "cmaf", label: "c-Maf", category: "transcriptionFactor", subsystem: "shared", synonyms: ["maf", "musculoaponeurotic fibrosarcoma"], description: "Transcription factor that induces IL-10 and IL-21, contributing to Tfh and regulatory programs." },
  { id: "blimp1", label: "BLIMP1", category: "transcriptionFactor", subsystem: "humoral", synonyms: ["prdm1", "b lymphocyte induced maturation protein 1"], description: "Master regulator of plasma-cell differentiation that shuts down the B-cell program in favor of antibody secretion." },
  { id: "pu1", label: "PU.1", category: "transcriptionFactor", subsystem: "cellular", synonyms: ["spi1"], description: "ETS-family transcription factor important for myeloid development and for the Th9 program." },

  // ===================== ANTIBODIES =====================
  { id: "igm", label: "IgM", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin m"], description: "First antibody isotype secreted in a primary response; pentameric and a potent activator of complement." },
  { id: "igd", label: "IgD", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin d"], description: "Co-expressed with IgM on naïve B cells as part of the antigen receptor; minor secreted roles." },
  { id: "igg1", label: "IgG1", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin g1"], description: "Major serum IgG subclass; neutralizes toxins/viruses and opsonizes for phagocytosis. Promoted by IL-4." },
  { id: "igg2", label: "IgG2a/b", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin g2", "igg2a", "igg2b"], description: "IgG subclass favored in Th1 responses (IFN-γ–driven); strong complement fixation and opsonization." },
  { id: "igg3", label: "IgG3", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin g3"], description: "IgG subclass with potent complement activation and Fc-receptor engagement, important against viruses." },
  { id: "iga", label: "IgA", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin a", "secretory iga"], description: "Dominant antibody at mucosal surfaces; neutralizes pathogens without inflammation. Promoted by TGF-β." },
  { id: "ige", label: "IgE", category: "antibody", subsystem: "humoral", synonyms: ["immunoglobulin e"], description: "Antibody that arms mast cells and basophils via FcεRI; central to Type I hypersensitivity and anti-parasite defense. Driven by IL-4/IL-13." },

  // ===================== RECEPTORS / SURFACE MOLECULES =====================
  { id: "tcr", label: "TCR", category: "receptor", subsystem: "cellular", synonyms: ["t cell receptor"], description: "T-cell antigen receptor that recognizes peptide presented on MHC, providing signal 1 for T-cell activation." },
  { id: "bcr", label: "BCR", category: "receptor", subsystem: "humoral", synonyms: ["b cell receptor", "surface immunoglobulin"], description: "Membrane immunoglobulin that binds native antigen and, when cross-linked, signals B-cell activation." },
  { id: "cd3", label: "CD3", category: "receptor", subsystem: "cellular", synonyms: ["cd3 complex"], description: "Signal-transducing complex associated with the TCR that propagates antigen-recognition signals." },
  { id: "cd28", label: "CD28", category: "receptor", subsystem: "cellular", synonyms: ["cd28 costimulator"], description: "Co-stimulatory receptor on T cells that binds CD80/86 to deliver signal 2 for full activation." },
  { id: "cd40", label: "CD40", category: "receptor", subsystem: "humoral", synonyms: ["cd40 receptor"], description: "Receptor on B cells/APCs that, engaged by CD40L, licenses B-cell activation, class switching, and DC maturation." },
  { id: "cd40l", label: "CD40L", category: "receptor", subsystem: "cellular", synonyms: ["cd154", "cd40 ligand"], description: "Ligand expressed by activated helper T cells that engages CD40 to provide essential help to B cells and APCs." },
  { id: "cd80-86", label: "CD80/86", category: "receptor", subsystem: "innate", synonyms: ["b7-1", "b7-2", "b7", "cd80", "cd86"], description: "Co-stimulatory B7 molecules on APCs that engage CD28 (activating) or CTLA-4 (inhibitory) on T cells." },
  { id: "icos", label: "ICOS", category: "receptor", subsystem: "cellular", synonyms: ["inducible costimulator", "cd278"], description: "Co-stimulatory receptor on activated T cells, important for Tfh function and germinal-center help." },
  { id: "icosl", label: "ICOSL", category: "receptor", subsystem: "humoral", synonyms: ["icos ligand", "b7h2", "cd275"], description: "Ligand for ICOS expressed on B cells and APCs, sustaining T-follicular-helper responses." },
  { id: "mhc1", label: "MHC-I", category: "receptor", subsystem: "cellular", synonyms: ["mhc class i", "hla class i"], description: "Molecule displaying intracellular (e.g., viral) peptides to CD8⁺ T cells; present on nearly all nucleated cells." },
  { id: "mhc2", label: "MHC-II", category: "receptor", subsystem: "shared", synonyms: ["mhc class ii", "hla class ii"], description: "Molecule on professional APCs that displays extracellular-derived peptides to CD4⁺ helper T cells." },
  { id: "cxcr5", label: "CXCR5", category: "receptor", subsystem: "humoral", synonyms: ["cxc chemokine receptor 5"], description: "Chemokine receptor for CXCL13 that guides Tfh and B cells into lymphoid follicles." },
  { id: "pd1", label: "PD-1", category: "receptor", subsystem: "shared", synonyms: ["programmed cell death 1", "cd279"], description: "Inhibitory checkpoint receptor on T cells that, engaged by PD-L1, dampens activation and enforces tolerance." },
  { id: "pdl1", label: "PD-L1", category: "receptor", subsystem: "shared", synonyms: ["programmed death ligand 1", "cd274", "b7-h1"], description: "Ligand for PD-1 expressed by APCs and peripheral tissues that delivers an inhibitory signal to T cells." },
  { id: "fcr", label: "Fc receptor", category: "receptor", subsystem: "innate", synonyms: ["fcr", "fcγr", "fcεr"], description: "Receptors for antibody Fc regions that link humoral immunity to phagocytosis, ADCC, and mast-cell triggering." },
  { id: "il6r", label: "IL-6R", category: "receptor", subsystem: "shared", synonyms: ["interleukin 6 receptor"], description: "Receptor for IL-6 that, with gp130, activates STAT3 signaling." },
  { id: "gp130", label: "gp130", category: "receptor", subsystem: "shared", synonyms: ["il6st", "glycoprotein 130"], description: "Shared signal-transducing subunit of the IL-6 cytokine-family receptors." },
  { id: "cd132", label: "CD132 (γc)", category: "receptor", subsystem: "shared", synonyms: ["common gamma chain", "il2rg", "gamma c"], description: "Common gamma chain shared by receptors for IL-2, IL-4, IL-7, IL-9, IL-15, and IL-21." },

  // ===================== FUNCTIONS / OUTCOMES =====================
  { id: "opsonization", label: "Opsonization", category: "function", subsystem: "humoral", synonyms: ["opsonisation"], description: "Antibody (and complement) coating of pathogens that flags them for phagocytosis via Fc/complement receptors." },
  { id: "neutralization", label: "Neutralization", category: "function", subsystem: "humoral", synonyms: ["neutralisation", "toxin neutralization", "virus neutralization"], description: "Antibody binding that blocks toxins or viruses from engaging host cells." },
  { id: "complement-fixation", label: "Complement fixation", category: "function", subsystem: "humoral", synonyms: ["complement activation"], description: "Antibody-triggered activation of the complement cascade leading to lysis, opsonization, and inflammation." },
  { id: "adcc", label: "ADCC", category: "function", subsystem: "shared", synonyms: ["antibody dependent cellular cytotoxicity"], description: "Killing of antibody-coated target cells by Fc-receptor-bearing effectors such as NK cells." },
  { id: "mucosal-immunity", label: "Mucosal immunity", category: "function", subsystem: "humoral", synonyms: ["mucosal defense", "secretory immunity"], description: "Protection at mucosal surfaces, dominated by secretory IgA and barrier-acting cytokines." },
  { id: "allergy-type1", label: "Type I hypersensitivity", category: "function", subsystem: "humoral", synonyms: ["allergy", "immediate hypersensitivity", "atopy", "anaphylaxis"], description: "Immediate IgE-mediated reaction in which allergen cross-links mast-cell-bound IgE, triggering degranulation." },
  { id: "delayed-hypersensitivity", label: "Delayed hypersensitivity", category: "function", subsystem: "cellular", synonyms: ["type iv hypersensitivity", "dth"], description: "Th1/macrophage-mediated reaction developing over 24–72 h, as in the tuberculin response and contact dermatitis." },
  { id: "cytotoxicity", label: "Cell-mediated cytotoxicity", category: "function", subsystem: "cellular", synonyms: ["killing", "perforin granzyme", "fas fasl", "apoptosis induction"], description: "Direct killing of infected or transformed cells by CTLs and NK cells via perforin/granzymes and Fas/FasL." },
  { id: "inflammation", label: "Inflammation", category: "function", subsystem: "innate", synonyms: ["inflammatory response"], description: "Coordinated vascular and cellular response to infection or injury, driven by IL-1, IL-6, and TNF-α." },
  { id: "fever", label: "Fever / acute phase", category: "function", subsystem: "innate", synonyms: ["pyrexia", "cachexia", "acute phase response"], description: "Systemic response to pyrogenic cytokines (IL-1, IL-6, TNF-α) raising body temperature and acute-phase proteins." },
  { id: "antiviral", label: "Antiviral defense", category: "function", subsystem: "cellular", synonyms: ["antiviral response", "virus defense"], description: "Control of viral infection through type I IFN, cytotoxic killing of infected cells, and antibody neutralization." },
  { id: "intracellular-defense", label: "Intracellular pathogen defense", category: "function", subsystem: "cellular", synonyms: ["macrophage killing", "intracellular killing"], description: "Th1/IFN-γ–licensed macrophage killing of intracellular bacteria and parasites." },
  { id: "antifungal-bacterial", label: "Anti-fungal/bacterial defense", category: "function", subsystem: "cellular", synonyms: ["extracellular bacteria", "fungal defense", "barrier defense"], description: "Th17-driven recruitment of neutrophils and induction of antimicrobial peptides at epithelial barriers." },
  { id: "tissue-remodeling", label: "Tissue remodeling", category: "function", subsystem: "shared", synonyms: ["fibrosis", "angiogenesis", "wound repair", "tissue repair"], description: "Cytokine-driven changes in tissue architecture, including repair, fibrosis, and angiogenesis." },
  { id: "hematopoiesis", label: "Hematopoiesis", category: "function", subsystem: "innate", synonyms: ["myelopoiesis", "blood cell production"], description: "Production and expansion of blood-cell lineages, stimulated by factors such as GM-CSF and G-CSF." },
  { id: "class-switch", label: "Class-switch recombination", category: "function", subsystem: "humoral", synonyms: ["isotype switching", "csr"], description: "B-cell DNA recombination that changes antibody isotype (e.g., to IgG, IgA, IgE) under cytokine guidance." },
  { id: "somatic-hypermutation", label: "Somatic hypermutation", category: "function", subsystem: "humoral", synonyms: ["shm"], description: "Programmed mutation of antibody variable regions in germinal centers, the substrate for affinity selection." },
  { id: "affinity-maturation", label: "Affinity maturation", category: "function", subsystem: "humoral", synonyms: ["improved affinity"], description: "Iterative selection of higher-affinity B cells in the germinal center, yielding better antibodies over time." },
  { id: "autoimmunity", label: "Autoimmunity", category: "function", subsystem: "shared", synonyms: ["autoimmune disease", "organ specific immunity", "loss of tolerance"], description: "Pathological immune attack on self, often linked to dysregulated Th1/Th17 responses or failed regulation." },
  { id: "tumor-defense", label: "Anti-tumor immunity", category: "function", subsystem: "cellular", synonyms: ["cancer defense", "tumor surveillance", "defense against cancer"], description: "Recognition and killing of transformed cells by CTLs and NK cells, central to immune surveillance." },
];

const edges: NetworkEdge[] = [
  // ---- T-helper differentiation from naïve CD4 ----
  { source: "naive-cd4", target: "th1", type: "differentiation", label: "IL-12, IFN-γ" },
  { source: "naive-cd4", target: "th2", type: "differentiation", label: "IL-4" },
  { source: "naive-cd4", target: "th9", type: "differentiation", label: "TGF-β + IL-4" },
  { source: "naive-cd4", target: "th17", type: "differentiation", label: "TGF-β, IL-6" },
  { source: "naive-cd4", target: "th22", type: "differentiation", label: "IL-6, TNF-α" },
  { source: "naive-cd4", target: "tfh", type: "differentiation", label: "IL-6, IL-21" },
  { source: "naive-cd4", target: "itreg", type: "differentiation", label: "TGF-β, IL-2" },
  { source: "naive-cd4", target: "th3", type: "differentiation", label: "TGF-β" },
  { source: "naive-cd8", target: "ctl", type: "differentiation", label: "IL-2, IL-12" },

  // ---- Master / signaling transcription factors ----
  { source: "th1", target: "tbet", type: "expressesTF" },
  { source: "th1", target: "stat1", type: "expressesTF" },
  { source: "th1", target: "stat4", type: "expressesTF" },
  { source: "th2", target: "gata3", type: "expressesTF" },
  { source: "th2", target: "stat6", type: "expressesTF" },
  { source: "th2", target: "irf4", type: "expressesTF" },
  { source: "th9", target: "pu1", type: "expressesTF" },
  { source: "th9", target: "irf4", type: "expressesTF" },
  { source: "th17", target: "rorgt", type: "expressesTF" },
  { source: "th17", target: "rora", type: "expressesTF" },
  { source: "th17", target: "stat3", type: "expressesTF" },
  { source: "th17", target: "irf4", type: "expressesTF" },
  { source: "th22", target: "stat3", type: "expressesTF" },
  { source: "tfh", target: "bcl6", type: "expressesTF" },
  { source: "tfh", target: "stat3", type: "expressesTF" },
  { source: "tfh", target: "cmaf", type: "expressesTF" },
  { source: "treg", target: "foxp3", type: "expressesTF" },
  { source: "itreg", target: "foxp3", type: "expressesTF" },
  { source: "ntreg", target: "foxp3", type: "expressesTF" },
  { source: "ctl", target: "tbet", type: "expressesTF" },
  { source: "plasma", target: "blimp1", type: "expressesTF" },
  { source: "plasma", target: "irf4", type: "expressesTF" },
  { source: "gc-b", target: "bcl6", type: "expressesTF" },

  // ---- Cytokines driving differentiation / activating TFs ----
  { source: "il12", target: "th1", type: "induces" },
  { source: "il12", target: "stat4", type: "drivesTF" },
  { source: "ifng", target: "tbet", type: "drivesTF" },
  { source: "il18", target: "ifng", type: "induces", label: "with IL-12" },
  { source: "il4", target: "th2", type: "induces" },
  { source: "il4", target: "stat6", type: "drivesTF" },
  { source: "il2", target: "treg", type: "induces", label: "survival" },
  { source: "tgfb", target: "itreg", type: "induces" },
  { source: "tgfb", target: "th17", type: "induces", label: "with IL-6" },
  { source: "il6", target: "th17", type: "induces" },
  { source: "il6", target: "stat3", type: "drivesTF" },
  { source: "il23", target: "th17", type: "induces", label: "stabilizes" },
  { source: "il21", target: "tfh", type: "induces" },
  { source: "il6", target: "tfh", type: "induces" },
  { source: "il4", target: "th9", type: "induces", label: "with TGF-β" },

  // ---- Receptor / co-stimulation wiring ----
  { source: "tcr", target: "cd3", type: "costimulation" },
  { source: "tcr", target: "mhc2", type: "bindsReceptor", label: "peptide–MHC-II" },
  { source: "cd28", target: "cd80-86", type: "bindsReceptor" },
  { source: "cd40l", target: "cd40", type: "bindsReceptor" },
  { source: "icos", target: "icosl", type: "bindsReceptor" },
  { source: "pd1", target: "pdl1", type: "bindsReceptor" },
  { source: "pd1", target: "tcr", type: "inhibits", label: "checkpoint" },
  { source: "cxcr5", target: "cxcl13", type: "bindsReceptor" },
  { source: "il6r", target: "il6", type: "bindsReceptor" },
  { source: "il6r", target: "gp130", type: "costimulation" },
  { source: "fcr", target: "igg1", type: "bindsReceptor" },
  { source: "fcr", target: "ige", type: "bindsReceptor" },
  { source: "ctl", target: "mhc1", type: "bindsReceptor", label: "TCR–peptide–MHC-I" },

  // ---- Dendritic cell priming ----
  { source: "dc", target: "naive-cd4", type: "costimulation", label: "antigen presentation" },
  { source: "dc", target: "naive-cd8", type: "costimulation", label: "cross-presentation" },
  { source: "dc", target: "il12", type: "secretes" },
  { source: "dc", target: "il23", type: "secretes" },
  { source: "dc", target: "il6", type: "secretes" },
  { source: "dc", target: "ifn1", type: "secretes" },
  { source: "dc", target: "mhc2", type: "costimulation" },
  { source: "dc", target: "cd80-86", type: "costimulation" },

  // ---- Th1 effector axis ----
  { source: "th1", target: "ifng", type: "secretes" },
  { source: "th1", target: "il2", type: "secretes" },
  { source: "th1", target: "tnfb", type: "secretes" },
  { source: "ifng", target: "macrophage", type: "induces", label: "classical activation" },
  { source: "macrophage", target: "intracellular-defense", type: "mediates" },
  { source: "th1", target: "delayed-hypersensitivity", type: "mediates" },
  { source: "th1", target: "intracellular-defense", type: "mediates" },
  { source: "ifng", target: "igg2", type: "induces", label: "class switch" },
  { source: "macrophage", target: "il12", type: "secretes" },
  { source: "macrophage", target: "tnfa", type: "secretes" },
  { source: "macrophage", target: "il1", type: "secretes" },
  { source: "macrophage", target: "il6", type: "secretes" },

  // ---- Th2 effector axis ----
  { source: "th2", target: "il4", type: "secretes" },
  { source: "th2", target: "il5", type: "secretes" },
  { source: "th2", target: "il13", type: "secretes" },
  { source: "il5", target: "eosinophil", type: "induces", label: "growth & survival" },
  { source: "eotaxin", target: "eosinophil", type: "induces", label: "recruitment" },
  { source: "il4", target: "ige", type: "induces", label: "class switch" },
  { source: "il4", target: "igg1", type: "induces", label: "class switch" },
  { source: "il13", target: "ige", type: "induces", label: "class switch" },
  { source: "th2", target: "allergy-type1", type: "mediates" },
  { source: "il13", target: "smooth-muscle", type: "induces", label: "airway changes" },
  { source: "il33", target: "th2", type: "induces" },
  { source: "il25", target: "th2", type: "induces" },
  { source: "basophil", target: "il4", type: "secretes" },

  // ---- Th9 / Th22 ----
  { source: "th9", target: "il9", type: "secretes" },
  { source: "il9", target: "mast", type: "induces", label: "growth" },
  { source: "th22", target: "il22", type: "secretes" },
  { source: "il22", target: "keratinocyte", type: "induces", label: "antimicrobial peptides" },

  // ---- Th17 effector axis ----
  { source: "th17", target: "il17", type: "secretes" },
  { source: "th17", target: "il22", type: "secretes" },
  { source: "th17", target: "il21", type: "secretes" },
  { source: "il17", target: "neutrophil", type: "induces", label: "recruitment" },
  { source: "il17", target: "il8", type: "induces" },
  { source: "il17", target: "keratinocyte", type: "induces" },
  { source: "il17", target: "fibroblast", type: "induces", label: "chemokines" },
  { source: "th17", target: "antifungal-bacterial", type: "mediates" },
  { source: "th17", target: "autoimmunity", type: "mediates" },
  { source: "il23", target: "il17", type: "induces" },

  // ---- Tfh / germinal center / B-cell help ----
  { source: "tfh", target: "il21", type: "secretes" },
  { source: "tfh", target: "cd40l", type: "costimulation", label: "to CD40 on B cell" },
  { source: "tfh", target: "icos", type: "costimulation" },
  { source: "tfh", target: "cxcr5", type: "expressesTF", label: "follicle homing" },
  { source: "fdc", target: "cxcl13", type: "secretes" },
  { source: "cxcl13", target: "tfh", type: "induces", label: "follicle homing" },
  { source: "tfh", target: "gc-b", type: "induces", label: "help" },
  { source: "il21", target: "plasma", type: "induces", label: "differentiation" },
  { source: "gc-b", target: "somatic-hypermutation", type: "mediates" },
  { source: "gc-b", target: "affinity-maturation", type: "mediates" },
  { source: "fdc", target: "affinity-maturation", type: "mediates", label: "antigen selection" },

  // ---- B-cell activation & antibody production ----
  { source: "naive-b", target: "bcr", type: "expressesTF", label: "surface Ig" },
  { source: "naive-b", target: "activated-b", type: "differentiation", label: "antigen + T help" },
  { source: "cd40l", target: "activated-b", type: "costimulation" },
  { source: "activated-b", target: "gc-b", type: "differentiation" },
  { source: "activated-b", target: "class-switch", type: "mediates" },
  { source: "gc-b", target: "plasmablast", type: "differentiation" },
  { source: "gc-b", target: "memory-b", type: "differentiation" },
  { source: "plasmablast", target: "plasma", type: "differentiation" },
  { source: "follicular-b", target: "gc-b", type: "differentiation" },
  { source: "plasma", target: "igm", type: "secretes" },
  { source: "plasma", target: "igg1", type: "secretes" },
  { source: "plasma", target: "igg2", type: "secretes" },
  { source: "plasma", target: "igg3", type: "secretes" },
  { source: "plasma", target: "iga", type: "secretes" },
  { source: "plasma", target: "ige", type: "secretes" },
  { source: "naive-b", target: "igd", type: "secretes", label: "surface" },
  { source: "tgfb", target: "iga", type: "induces", label: "class switch" },

  // ---- Antibody effector functions ----
  { source: "igm", target: "complement-fixation", type: "mediates" },
  { source: "igm", target: "neutralization", type: "mediates" },
  { source: "igg1", target: "opsonization", type: "mediates" },
  { source: "igg1", target: "neutralization", type: "mediates" },
  { source: "igg2", target: "complement-fixation", type: "mediates" },
  { source: "igg2", target: "opsonization", type: "mediates" },
  { source: "igg3", target: "complement-fixation", type: "mediates" },
  { source: "igg1", target: "adcc", type: "mediates" },
  { source: "iga", target: "mucosal-immunity", type: "mediates" },
  { source: "ige", target: "allergy-type1", type: "mediates", label: "via mast cells" },
  { source: "ige", target: "mast", type: "bindsReceptor", label: "FcεRI" },

  // ---- Treg regulation ----
  { source: "treg", target: "il10", type: "secretes" },
  { source: "treg", target: "tgfb", type: "secretes" },
  { source: "treg", target: "th1", type: "inhibits" },
  { source: "treg", target: "th17", type: "inhibits" },
  { source: "il10", target: "inflammation", type: "inhibits" },
  { source: "il10", target: "macrophage", type: "inhibits", label: "deactivation" },
  { source: "treg", target: "autoimmunity", type: "inhibits", label: "tolerance" },
  { source: "th3", target: "tgfb", type: "secretes" },

  // ---- Cytotoxic effectors ----
  { source: "ctl", target: "ifng", type: "secretes" },
  { source: "ctl", target: "tnfa", type: "secretes" },
  { source: "ctl", target: "cytotoxicity", type: "mediates", label: "perforin/granzyme, Fas" },
  { source: "ctl", target: "antiviral", type: "mediates" },
  { source: "ctl", target: "tumor-defense", type: "mediates" },
  { source: "nk", target: "ifng", type: "secretes" },
  { source: "nk", target: "cytotoxicity", type: "mediates", label: "missing self" },
  { source: "nk", target: "adcc", type: "mediates", label: "via Fc receptor" },
  { source: "nk", target: "tumor-defense", type: "mediates" },
  { source: "il12", target: "nk", type: "induces", label: "IFN-γ production" },
  { source: "il15", target: "nk", type: "induces", label: "survival" },
  { source: "ifn1", target: "antiviral", type: "mediates" },

  // ---- Innate inflammation & hematopoiesis ----
  { source: "il1", target: "inflammation", type: "induces" },
  { source: "il6", target: "inflammation", type: "induces" },
  { source: "tnfa", target: "inflammation", type: "induces" },
  { source: "il1", target: "fever", type: "induces" },
  { source: "il6", target: "fever", type: "induces" },
  { source: "tnfa", target: "fever", type: "induces" },
  { source: "tnfa", target: "endothelial", type: "induces", label: "activation" },
  { source: "il8", target: "neutrophil", type: "induces", label: "recruitment" },
  { source: "neutrophil", target: "antifungal-bacterial", type: "mediates" },
  { source: "gcsf", target: "neutrophil", type: "induces", label: "production" },
  { source: "gmcsf", target: "hematopoiesis", type: "induces", label: "myeloid expansion" },
  { source: "gcsf", target: "hematopoiesis", type: "induces" },
  { source: "monocyte", target: "macrophage", type: "differentiation" },
  { source: "monocyte", target: "dc", type: "differentiation" },
  { source: "stromal", target: "hematopoiesis", type: "induces", label: "growth factors" },
  { source: "epithelial", target: "il33", type: "secretes", label: "alarmin" },
  { source: "epithelial", target: "il25", type: "secretes", label: "alarmin" },
  { source: "fibroblast", target: "il6", type: "secretes" },
  { source: "endothelial", target: "il8", type: "secretes" },
  { source: "mast", target: "allergy-type1", type: "mediates", label: "degranulation" },
  { source: "mast", target: "il4", type: "secretes" },
  { source: "tnfa", target: "tissue-remodeling", type: "induces" },
  { source: "il13", target: "tissue-remodeling", type: "induces", label: "fibrosis" },

  // ---- IL-3, IL-27, common gamma chain ----
  { source: "th2", target: "il3", type: "secretes" },
  { source: "il3", target: "basophil", type: "induces", label: "growth" },
  { source: "il3", target: "hematopoiesis", type: "induces", label: "myeloid progenitors" },
  { source: "dc", target: "il27", type: "secretes" },
  { source: "il27", target: "th1", type: "induces", label: "early polarization" },
  { source: "il27", target: "il10", type: "induces", label: "regulatory" },
  { source: "il2", target: "cd132", type: "bindsReceptor", label: "shared γc" },
  { source: "il21", target: "cd132", type: "bindsReceptor", label: "shared γc" },
  { source: "il4", target: "cd132", type: "bindsReceptor", label: "shared γc" },
];

export const networkData: NetworkData = { nodes, edges };
