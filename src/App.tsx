import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type WindowName = "about" | "resume" | "contact" | "project" | "photos" | "safari" | "chrome" | "maps" | "messages" | "mail" | "skills" | "education"

type Project = {
  id: string
  name: string
  subtitle: string
  period: string
  intro: string
  bullets: string[]
  tags: string[]
  accent: string
}

const projects: Project[] = [
  {
    id: "01",
    name: "Smart Estate",
    subtitle: "Real Estate ERP / SaaS",
    period: "Sep 2025 — Present",
    intro:
      "A large-scale real estate platform spanning sales, CRM, marketing, accounts, billing, and administration.",
    bullets: [
      "Designed workflows for leads, bookings, payments, approvals, referrals, users, permissions, and customer management.",
      "Created dashboards, analytics, configuration flows, and scalable design systems for distinct user roles.",
      "Partnered with stakeholders and developers from requirement analysis through prototype and implementation.",
    ],
    tags: ["Product design", "ERP", "Design systems"],
    accent: "violet",
  },
  {
    id: "02",
    name: "Poorvika",
    subtitle: "eCommerce Experience",
    period: "Aug 2024 — Jul 2025",
    intro:
      "A complete eCommerce experience refresh focused on consistency, engagement, and a clearer path to purchase.",
    bullets: [
      "Redesigned 30+ eCommerce pages, improving UI consistency and engagement.",
      "UX audit contributed to 22% higher engagement and 12% lower bounce rate.",
      "Improved checkout and delivery experiences, contributing to 18% higher retention.",
    ],
    tags: ["eCommerce", "UX audit", "Conversion"],
    accent: "blue",
  },
  {
    id: "03",
    name: "California Software - Intern",
    subtitle: "Enterprise & B2B Products",
    period: "Feb 2024 — Jul 2024",
    intro:
      "Responsive enterprise product design shaped through usability testing and close stakeholder collaboration.",
    bullets: [
      "Designed wireframes, prototypes, and responsive interfaces for enterprise and B2B products.",
      "Conducted usability testing and facilitated stakeholder discussions.",
      "Created clear design documentation for developer handoff.",
    ],
    tags: ["B2B", "Prototyping", "Usability"],
    accent: "orange",
  },
  {
    id: "04",
    name: "Collab Hub - Intern",
    subtitle: "Web, Mobile & Brand",
    period: "Dec 2023 — Jan 2024",
    intro:
      "An early-career exploration of responsive digital products and cohesive visual identities.",
    bullets: [
      "Designed responsive web and mobile interfaces.",
      "Created brand identity assets and visual design foundations.",
      "Connected product thinking with graphic design craft.",
    ],
    tags: ["Visual design", "Responsive", "Brand"],
    accent: "green",
  },
]

const WindowStackContext = createContext<{
  index: number
  offset: number
  focus: () => void
}>({ index: 0, offset: 0, focus: () => {} })

const BASE = import.meta.env.BASE_URL

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i
const fileName = (path: string) => path.split("/").pop() ?? path
const humanize = (path: string) =>
  fileName(path)
    .replace(IMAGE_EXT, "")
    .replace(/^[\d\s._-]+/, "")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase()) || fileName(path)

// Any png / jpg / jpeg / webp / gif / avif / svg dropped into src/photos shows up automatically.
const photoModules = import.meta.glob("./photos/*.{png,jpg,jpeg,webp,gif,avif,svg,PNG,JPG,JPEG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>

// Project cover images: src/project-images/project-01.png (or .jpg, .webp, .svg …).
const projectModules = import.meta.glob("./project-images/*.{png,jpg,jpeg,webp,gif,avif,svg,PNG,JPG,JPEG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>

// Real raster images win over the placeholder .svg when both exist.
const projectImage = (id: string): string | undefined => {
  const matches = Object.entries(projectModules).filter(([path]) =>
    fileName(path).toLowerCase().startsWith(`project-${id}.`),
  )
  matches.sort(
    ([a], [b]) => Number(/\.svg$/i.test(a)) - Number(/\.svg$/i.test(b)),
  )
  return matches[0]?.[1]
}
const RESUME_URL = `${BASE}Suren-A-Resume.pdf`

const DockIcon = ({ type }: { type: string }) => {
  const paths: Record<string, React.ReactNode> = {
    finder: (
      <>
        <path d="M8 3v18M8 8c2.5 1.2 5.5 1.2 8 0M5.5 14.5c3 2 10 2 13 0" />
        <path d="M3 3h18v18H3z" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    safari: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="6.5" opacity=".45" />
        <path d="m14.7 9.3-1.8 4-3.6 1.4 1.8-4 3.6-1.4Z" />
      </>
    ),
    chrome: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.4" />
        <path d="M12 3h8M4.3 7.5l4 7M15.4 15.4l-4.2 5.4" />
      </>
    ),
    maps: (
      <>
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z" />
        <path d="M9 3v16M15 5v16" />
        <path d="M16.8 8.3a2.3 2.3 0 1 1-4.6 0c0-1.8 2.3-4.3 2.3-4.3s2.3 2.5 2.3 4.3Z" />
      </>
    ),
    message: (
      <path d="M12 3c5 0 9 3.5 9 7.8s-4 7.8-9 7.8c-1.1 0-2.2-.2-3.1-.5L4 21l1.2-4.4C3.8 15.2 3 13.1 3 10.8 3 6.5 7 3 12 3Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    file: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 12h6M9 16h6" />
      </>
    ),
    link: (
      <>
        <path d="M10 14a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
        <path d="M14 10a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
      </>
    ),
    photos: (
      <>
        <circle cx="12" cy="7" r="4" />
        <circle cx="17" cy="10" r="4" />
        <circle cx="16" cy="16" r="4" />
        <circle cx="9" cy="17" r="4" />
        <circle cx="7" cy="11" r="4" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    trash: (
      <>
        <path d="M6 7h12l-1 14H7L6 7Z" />
        <path d="M4 7h16M9 7V4h6v3M10 10v7M14 10v7" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    wifi: (
      <path d="M3 9a14 14 0 0 1 18 0M6 13a9 9 0 0 1 12 0M9.5 17a4 4 0 0 1 5 0M12 20h.01" />
    ),
    battery: (
      <>
        <rect x="2" y="7" width="18" height="10" rx="2" />
        <path d="M22 10v4M5 10h11v4H5z" />
      </>
    ),
  }
  return (
    <svg
      className={`mac-glyph mac-glyph-${type}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  )
}

function Folder({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      className="desktop-file folder-file"
      onDoubleClick={onOpen}
      onClick={onOpen}
    >
      <span className="folder-icon" aria-hidden="true">
        <span />
      </span>
      <span className="file-label">{label}</span>
    </button>
  )
}

function DraggableDesktopItem({
  id,
  initialPosition,
  children,
  onActivate,
}: {
  id: string
  initialPosition: { x: number; y: number }
  children: React.ReactNode
  onActivate?: () => void
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  const drag = useRef({
    active: false,
    moved: false,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
  })
  const [position, setPosition] = useState(() => {
    try {
      const saved = window.localStorage.getItem(`desktop-position-${id}`)
      if (saved) return JSON.parse(saved) as { x: number; y: number }
    } catch {
      // Fall back to the default position when storage is unavailable.
    }
    return initialPosition
  })
  const [dragging, setDragging] = useState(false)

  const clampPosition = (x: number, y: number) => {
    const width = itemRef.current?.offsetWidth ?? 116
    const height = itemRef.current?.offsetHeight ?? 92
    return {
      x: Math.max(4, Math.min(window.innerWidth - width - 4, x)),
      y: Math.max(34, Math.min(window.innerHeight - height - 82, y)),
    }
  }

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    drag.current = {
      active: true,
      moved: false,
      x: event.clientX,
      y: event.clientY,
      left: position.x,
      top: position.y,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    const deltaX = event.clientX - drag.current.x
    const deltaY = event.clientY - drag.current.y
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) drag.current.moved = true
    setPosition(
      clampPosition(drag.current.left + deltaX, drag.current.top + deltaY),
    )
  }

  const endDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    activate = true,
  ) => {
    if (!drag.current.active) return
    const shouldActivate = activate && !drag.current.moved
    drag.current.active = false
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const finalPosition = clampPosition(
      drag.current.left + event.clientX - drag.current.x,
      drag.current.top + event.clientY - drag.current.y,
    )
    setPosition(finalPosition)
    try {
      window.localStorage.setItem(
        `desktop-position-${id}`,
        JSON.stringify(finalPosition),
      )
    } catch {
      // Dragging remains available even when storage is unavailable.
    }
    if (shouldActivate) onActivate?.()
  }

  return (
    <div
      ref={itemRef}
      className={`draggable-desktop-item ${dragging ? "dragging" : ""}`}
      style={{ left: position.x, top: position.y }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={(event) => endDrag(event, false)}
      onClickCapture={(event) => {
        if (!drag.current.moved) return
        event.preventDefault()
        event.stopPropagation()
        drag.current.moved = false
      }}
    >
      {children}
    </div>
  )
}

function WindowChrome({
  title,
  subtitle,
  onClose,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  const stack = useContext(WindowStackContext)
  const windowRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, x: 0, y: 0, left: 0, top: 0 })
  const [maximized, setMaximized] = useState(false)

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      window.innerWidth < 720 ||
      !windowRef.current ||
      maximized ||
      (event.target as HTMLElement).closest("button")
    )
      return
    const rect = windowRef.current.getBoundingClientRect()
    windowRef.current.style.margin = "0"
    drag.current = {
      active: true,
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !windowRef.current) return
    const left = Math.max(
      8,
      Math.min(
        window.innerWidth - windowRef.current.offsetWidth - 8,
        drag.current.left + event.clientX - drag.current.x,
      ),
    )
    const top = Math.max(
      38,
      Math.min(
        window.innerHeight - 110,
        drag.current.top + event.clientY - drag.current.y,
      ),
    )
    windowRef.current.style.left = `${left}px`
    windowRef.current.style.top = `${top}px`
    windowRef.current.style.transform = "none"
  }

  return (
    <section
      ref={windowRef}
      className={`mac-window ${className} ${maximized ? "maximized" : ""}`}
      aria-label={title}
      style={{
        zIndex: 80 + stack.index,
        marginLeft: stack.offset,
        marginTop: stack.offset,
      }}
      onPointerDownCapture={stack.focus}
    >
      <div
        className="window-bar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => (drag.current.active = false)}
      >
        <div className="traffic-lights">
          <button
            className="traffic close"
            aria-label={`Close ${title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          />
          <button
            className="traffic minimize"
            aria-label={`Minimize ${title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          />
          <button
            className="traffic maximize"
            aria-label={maximized ? `Restore ${title}` : `Maximize ${title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setMaximized((current) => !current)}
          />
        </div>
        <div className="window-heading">
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </div>
        <div className="view-controls" aria-hidden="true">
          <span>≡</span>
          <span>▦</span>
        </div>
      </div>
      {children}
    </section>
  )
}

function AboutWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowChrome
      title="about-suren.txt"
      onClose={onClose}
      className="about-window"
    >
      <div className="about-content">
        <div className="portrait-card" aria-hidden="true">
          <span className="portrait-orbit orbit-one" />
          <span className="portrait-orbit orbit-two" />
          <span className="portrait-monogram">SA</span>
          <span className="portrait-caption">DESIGNING WITH INTENT</span>
        </div>
        <div className="about-copy">
          <span className="eyebrow">Hello, I’m Suren.</span>
          <p className="lead">
            I’m a UI/UX & Product Designer turning complex requirements into
            clear, intuitive digital products.
          </p>
          <p>
            For 2+ years, I’ve designed web and mobile experiences across SaaS,
            ERP, eCommerce, and B2B platforms—from early workflows to polished,
            developer-ready systems.
          </p>
          <div className="skill-pills">
            {[
              "Product design",
              "UX research",
              "Prototyping",
              "Design systems",
            ].map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  )
}

function ProjectWindow({
  selected,
  onSelect,
  onOpen,
  onClose,
}: {
  selected: Project
  onSelect: (project: Project) => void
  onOpen: (windowName: WindowName) => void
  onClose: () => void
}) {
  return (
    <WindowChrome
      title={`${selected.name} — Project ${selected.id}`}
      subtitle={selected.subtitle}
      onClose={onClose}
      className="project-window"
    >
      <div className="finder-layout">
        <aside className="finder-sidebar">
          <span className="sidebar-title">Favorites</span>
          <button onClick={() => onSelect(projects[0])}>
            <DockIcon type="grid" />
            Work
          </button>
          <button onClick={() => onOpen("about")}>
            <DockIcon type="user" />
            About Me
          </button>
          <button onClick={() => onOpen("resume")}>
            <DockIcon type="file" />
            Resume
          </button>
          <button onClick={() => onOpen("photos")}>
            <DockIcon type="photos" />
            Photos
          </button>
          <button onClick={() => onOpen("skills")}>
            <DockIcon type="grid" />
            Skills & Tools
          </button>
          <button onClick={() => onOpen("education")}>
            <DockIcon type="file" />
            Education
          </button>
          <span className="sidebar-title project-label">Projects</span>
          {projects.map((project) => (
            <button
              className={selected.id === project.id ? "active" : ""}
              onClick={() => onSelect(project)}
              key={project.id}
            >
              <DockIcon type="file" />
              Project {project.id}
            </button>
          ))}
        </aside>
        <div className="project-detail">
          <div className="project-art">
            {projectImage(selected.id) && (
              <img
                src={projectImage(selected.id)}
                alt={`${selected.name} cover`}
                draggable={false}
              />
            )}
          </div>
          <div className="project-copy">
            <div>
              <span className="eyebrow">{selected.period}</span>
              <p className="project-intro">{selected.intro}</p>
            </div>
            <ul>
              {selected.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="skill-pills">
              {selected.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  )
}

function ResumeWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowChrome
      title="Suren A — Resume.pdf"
      subtitle="1 page"
      onClose={onClose}
      className="resume-window"
    >
      <div className="resume-toolbar">
        <a href={RESUME_URL} download>
          Download PDF
        </a>
        <span>100%</span>
      </div>
      <iframe
        title="Suren A resume"
        src={`${RESUME_URL}#toolbar=0&view=FitH`}
      />
    </WindowChrome>
  )
}

function ContactWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowChrome
      title="Let’s work together"
      subtitle="Contacts"
      onClose={onClose}
      className="contact-window"
    >
      <div className="contact-content">
        <span className="contact-avatar">SA</span>
        <span className="eyebrow">Available for thoughtful product work</span>
        <p>Have a complex product that needs to feel simple? Let’s talk.</p>
        <a href="mailto:surenofficial786@gmail.com" className="contact-link">
          <DockIcon type="mail" /> surenofficial786@gmail.com
        </a>
        <a href="tel:+917871754842" className="contact-link">
          <DockIcon type="link" /> +91 78717 54842
        </a>
        <span className="location">
          Chennai, India · English · Tamil · Telugu
        </span>
      </div>
    </WindowChrome>
  )
}

const photoFiles = Object.entries(photoModules)
  .sort(([a], [b]) =>
    fileName(a).localeCompare(fileName(b), undefined, { numeric: true }),
  )
  .map(([path, url]) => ({ file: fileName(path), url, title: humanize(path) }))

function PhotosWindow({ onClose }: { onClose: () => void }) {
  const [activePhoto, setActivePhoto] = useState<(typeof photoFiles)[number] | undefined>(photoFiles[0])

  return (
    <WindowChrome
      title="Photos"
      subtitle={`${photoFiles.length} items`}
      onClose={onClose}
      className="photos-window"
    >
      <div className="photos-layout">
        <div className="photo-preview">
          {activePhoto ? (
            <>
              <img src={activePhoto.url} alt={activePhoto.title} />
              <div>
                <strong>{activePhoto.title}</strong>
                <span>{activePhoto.file}</span>
              </div>
            </>
          ) : (
            <div className="photo-empty">
              <strong>No photos yet</strong>
              <span>Add png, jpg, webp or svg files to src/photos</span>
            </div>
          )}
        </div>
        <div className="photo-strip">
          {photoFiles.map((photo) => (
            <button
              className={activePhoto?.file === photo.file ? "active" : ""}
              key={photo.file}
              onClick={() => setActivePhoto(photo)}
              aria-label={`View ${photo.title}`}
            >
              <img src={photo.url} alt="" />
              <span>{photo.title}</span>
            </button>
          ))}
        </div>
      </div>
    </WindowChrome>
  )
}

function ResumeSectionWindow({
  section,
  onClose,
}: {
  section: "skills" | "education"
  onClose: () => void
}) {
  return (
    <WindowChrome
      title={section === "skills" ? "Skills & Tools" : "Education"}
      subtitle="Suren A — Resume"
      onClose={onClose}
      className="resume-section-window"
    >
      {section === "skills" ? (
        <div className="skills-content">
          <div>
            <span className="eyebrow">UX</span>
            <p>
              User Flows · Wireframing · Prototyping · Information Architecture
              · Usability Testing · UX Research · Interaction Design
            </p>
          </div>
          <div>
            <span className="eyebrow">UI</span>
            <p>
              Visual Design · Responsive Design · Design Systems · Accessibility
              · Micro-interactions
            </p>
          </div>
          <div>
            <span className="eyebrow">Product</span>
            <p>
              Product Design · Dashboard Design · SaaS/ERP · Design
              Documentation · Developer Handoff · Agile Collaboration
            </p>
          </div>
          <div>
            <span className="eyebrow">Tools</span>
            <p>
              Figma · Figma Make · Adobe XD · Illustrator · Photoshop · Framer ·
              Miro · Blender
            </p>
          </div>
          <div>
            <span className="eyebrow">Languages</span>
            <p>English · Tamil · Telugu</p>
          </div>
        </div>
      ) : (
        <div className="education-content">
          <div>
            <span>2021</span>
            <strong>B.Sc. Visual Communication</strong>
            <p>Bharath University, Chennai</p>
          </div>
          <div>
            <span>2023</span>
            <strong>Certificate in UI/UX Design</strong>
            <p>Image Creative Centre, Chennai</p>
          </div>
        </div>
      )}
    </WindowChrome>
  )
}

function DockAppWindow({
  app,
  onClose,
  onOpen,
  onProject,
}: {
  app: "safari" | "chrome" | "maps" | "messages" | "mail"
  onClose: () => void
  onOpen: (windowName: WindowName) => void
  onProject: (project: Project) => void
}) {
  const titles = {
    safari: "Suren’s Portfolio — Safari",
    chrome: "Projects — Google Chrome",
    maps: "Chennai — Maps",
    messages: "Messages",
    mail: "New Message — Mail",
  }

  return (
    <WindowChrome
      title={titles[app]}
      subtitle={app === "maps" ? "Chennai, Tamil Nadu" : undefined}
      onClose={onClose}
      className={`utility-window utility-${app}`}
    >
      {app === "safari" && (
        <div className="browser-window">
          <div className="browser-toolbar">
            <span>‹</span>
            <span>›</span>
            <div>suren.design</div>
          </div>
          <div className="browser-home">
            <span className="eyebrow">Start Page</span>
            <strong>Where would you like to go?</strong>
            <div className="browser-favorites">
              <button onClick={() => onProject(projects[0])}>
                <DockIcon type="finder" />
                Work
              </button>
              <button onClick={() => onOpen("about")}>
                <DockIcon type="user" />
                About
              </button>
              <button onClick={() => onOpen("resume")}>
                <DockIcon type="file" />
                Resume
              </button>
              <button onClick={() => onOpen("photos")}>
                <DockIcon type="photos" />
                Photos
              </button>
            </div>
          </div>
        </div>
      )}

      {app === "chrome" && (
        <div className="chrome-window">
          <div className="chrome-tabs">
            <span>Portfolio projects</span>
            <div>suren.design/work</div>
          </div>
          <div className="chrome-project-grid">
            {projects.map((project) => (
              <button key={project.id} onClick={() => onProject(project)}>
                <span>{project.id}</span>
                <strong>{project.name}</strong>
                <small>{project.subtitle}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {app === "maps" && (
        <div className="maps-window">
          <div className="map-grid" />
          <div className="map-pin">
            <span>SA</span>
          </div>
          <div className="map-card">
            <strong>Suren A</strong>
            <span>UI/UX & Product Designer</span>
            <small>Chennai, Tamil Nadu, India</small>
            <button onClick={() => onOpen("contact")}>Contact</button>
          </div>
        </div>
      )}

      {app === "messages" && (
        <div className="messages-window">
          <aside>
            <strong>Suren A</strong>
            <span>Available</span>
          </aside>
          <div className="conversation">
            <span className="message received">
              Hi! Thanks for visiting my portfolio.
            </span>
            <span className="message received">
              Have a product challenge? I’d love to hear about it.
            </span>
            <a href="mailto:surenofficial786@gmail.com">Send a message</a>
          </div>
        </div>
      )}

      {app === "mail" && (
        <div className="mail-window">
          <div>
            <span>To:</span> surenofficial786@gmail.com
          </div>
          <div>
            <span>Subject:</span> Let’s work together
          </div>
          <p>
            Hi Suren,
            <br />
            <br />I saw your portfolio and would like to discuss a product
            design opportunity.
          </p>
          <a href="mailto:surenofficial786@gmail.com?subject=Let's%20work%20together">
            Send with Mail
          </a>
        </div>
      )}
    </WindowChrome>
  )
}


type SearchItem = {
  label: string
  hint: string
  keywords: string
  run: (api: {
    onOpen: (name: WindowName) => void
    onProject: (project: Project) => void
  }) => void
}

const searchItems: SearchItem[] = [
  {
    label: "About Me",
    hint: "Folder",
    keywords: "about suren bio designer hello intro",
    run: ({ onOpen }) => onOpen("about"),
  },
  {
    label: "Resume.pdf",
    hint: "Document",
    keywords: "resume cv pdf download experience",
    run: ({ onOpen }) => onOpen("resume"),
  },
  {
    label: "Skills & Tools",
    hint: "Folder",
    keywords:
      "skills tools figma ux ui prototyping wireframing research design systems adobe framer miro blender",
    run: ({ onOpen }) => onOpen("skills"),
  },
  {
    label: "Education",
    hint: "Folder",
    keywords: "education degree visual communication bharath university certificate image creative",
    run: ({ onOpen }) => onOpen("education"),
  },
  {
    label: "Photos",
    hint: "Folder",
    keywords: "photos pictures gallery images",
    run: ({ onOpen }) => onOpen("photos"),
  },
  {
    label: "Contact",
    hint: "Contacts",
    keywords: "contact email phone mail hire work together chennai",
    run: ({ onOpen }) => onOpen("contact"),
  },
  ...projects.map(
    (project): SearchItem => ({
      label: `Project ${project.id} — ${project.name}`,
      hint: project.subtitle,
      keywords: `${project.name} ${project.subtitle} ${project.intro} ${project.tags.join(" ")} project work`,
      run: ({ onProject }) => onProject(project),
    }),
  ),
]

function SearchPanel({
  onClose,
  onOpen,
  onProject,
}: {
  onClose: () => void
  onOpen: (name: WindowName) => void
  onProject: (project: Project) => void
}) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return searchItems
    return searchItems
      .map((item) => {
        const label = item.label.toLowerCase()
        const haystack = `${label} ${item.keywords.toLowerCase()}`
        if (!terms.every((term) => haystack.includes(term))) return null
        const score = terms.reduce(
          (sum, term) => sum + (label.includes(term) ? 2 : 1),
          0,
        )
        return { item, score }
      })
      .filter((entry): entry is { item: SearchItem; score: number } => !!entry)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
  }, [query])

  const choose = (item: SearchItem | undefined) => {
    if (item) item.run({ onOpen, onProject })
  }

  return (
    <div className="spotlight-backdrop" onPointerDown={onClose}>
      <div
        className="spotlight"
        role="dialog"
        aria-label="Search portfolio"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          placeholder="Search projects, skills, resume…"
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              setActive((i) => Math.min(i + 1, results.length - 1))
            } else if (event.key === "ArrowUp") {
              event.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (event.key === "Enter") {
              choose(results[active])
            }
          }}
        />
        <ul>
          {results.map((item, index) => (
            <li key={item.label}>
              <button
                className={index === active ? "active" : ""}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </button>
            </li>
          ))}
          {!results.length && <li className="empty">No results for “{query}”</li>}
        </ul>
      </div>
    </div>
  )
}

export default function App() {
  const [windows, setWindows] = useState<WindowName[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(projects[0])
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const formattedTime = useMemo(
    () =>
      time.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }) +
      "  " +
      time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    [time],
  )

  // Opening a window that is already open just brings it to the front.
  const openWin = (name: WindowName) => {
    setSearchOpen(false)
    setWindows((current) => [...current.filter((w) => w !== name), name])
  }
  const closeWin = (name: WindowName) =>
    setWindows((current) => current.filter((w) => w !== name))
  const closeTop = () => setWindows((current) => current.slice(0, -1))

  const openProject = (project: Project) => {
    setSelectedProject(project)
    openWin("project")
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen((current) => !current)
      } else if (event.key === "Escape") {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const viewportWidth = typeof window === "undefined" ? 1440 : window.innerWidth

  return (
    <main className="desktop">
      <header className="menu-bar">
        <button
          className="apple-mark"
          aria-label="Close open window"
          onClick={closeTop}
        >
          <svg viewBox="0 0 384 512" aria-hidden="true">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9ZM261.6 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3Z" />
          </svg>
        </button>
        <strong>Finder</strong>
        <button onClick={() => openWin("project")}>File</button>
        <button onClick={() => openWin("about")}>Edit</button>
        <button onClick={() => openWin("photos")}>View</button>
        <button onClick={() => openWin("project")}>Go</button>
        <button onClick={() => openWin("resume")}>Window</button>
        <button onClick={() => openWin("contact")}>Help</button>
        <div className="menu-spacer" />
        <button
          className="menu-icon"
          aria-label="Search portfolio"
          onClick={() => setSearchOpen((current) => !current)}
        >
          <DockIcon type="search" />
        </button>
        <button
          className="menu-icon"
          aria-label="Contact status"
          onClick={() => openWin("contact")}
        >
          <DockIcon type="wifi" />
        </button>
        <button
          className="menu-icon"
          aria-label="Open resume"
          onClick={() => openWin("resume")}
        >
          <DockIcon type="battery" />
        </button>
        <div className="menu-time">
          <time>{formattedTime}</time>
        </div>
      </header>

      <div className="desktop-canvas">
        <div className="sticky-note">
          <strong>Today’s focus</strong>
          <span>Make complex things feel simple.</span>
          <span>Design with intention.</span>
          <span className="done">Chase decoration</span>
          <span>Build systems that scale.</span>
          <span>Keep learning, always.</span>
        </div>

        <div className="hero-copy">
          <span>hello, I’m Suren — welcome to my</span>
          <h1>portfolio.</h1>
          <p>UI/UX & Product Designer · Chennai, India</p>
        </div>

        <DraggableDesktopItem
          id="resume"
          initialPosition={{ x: viewportWidth - 270, y: 312 }}
          onActivate={() => openWin("resume")}
        >
          <button
            className="desktop-file resume-file"
            onClick={() => openWin("resume")}
          >
            <span className="paper-icon">
              <i>PDF</i>
            </span>
            <span className="file-label">Resume.pdf</span>
          </button>
        </DraggableDesktopItem>

        <DraggableDesktopItem
          id="about"
          initialPosition={{ x: viewportWidth - 270, y: 196 }}
          onActivate={() => openWin("about")}
        >
          <Folder label="About Me" onOpen={() => openWin("about")} />
        </DraggableDesktopItem>

        <DraggableDesktopItem
          id="photos"
          initialPosition={{ x: viewportWidth - 270, y: 72 }}
          onActivate={() => openWin("photos")}
        >
          <Folder label="Photos" onOpen={() => openWin("photos")} />
        </DraggableDesktopItem>

        <DraggableDesktopItem
          id="skills"
          initialPosition={{ x: 22, y: 470 }}
          onActivate={() => openWin("skills")}
        >
          <Folder
            label="Skills & Tools"
            onOpen={() => openWin("skills")}
          />
        </DraggableDesktopItem>

        <DraggableDesktopItem
          id="education"
          initialPosition={{ x: 148, y: 470 }}
          onActivate={() => openWin("education")}
        >
          <Folder label="Education" onOpen={() => openWin("education")} />
        </DraggableDesktopItem>

        {projects.map((project, index) => (
          <DraggableDesktopItem
            id={`project-${project.id}`}
            initialPosition={{ x: viewportWidth - 134, y: 68 + index * 116 }}
            key={project.id}
            onActivate={() => openProject(project)}
          >
            <Folder
              label={`Project ${project.id} (${project.name})`}
              onOpen={() => openProject(project)}
            />
          </DraggableDesktopItem>
        ))}

        {windows.map((name, index) => {
          const close = () => closeWin(name)
          const content = (() => {
            switch (name) {
              case "about":
                return <AboutWindow onClose={close} />
              case "project":
                return (
                  <ProjectWindow
                    selected={selectedProject}
                    onSelect={setSelectedProject}
                    onOpen={openWin}
                    onClose={close}
                  />
                )
              case "resume":
                return <ResumeWindow onClose={close} />
              case "contact":
                return <ContactWindow onClose={close} />
              case "photos":
                return <PhotosWindow onClose={close} />
              case "skills":
              case "education":
                return <ResumeSectionWindow section={name} onClose={close} />
              default:
                return (
                  <DockAppWindow
                    app={name}
                    onClose={close}
                    onOpen={openWin}
                    onProject={openProject}
                  />
                )
            }
          })()
          return (
            <WindowStackContext.Provider
              key={name}
              value={{
                index,
                offset: viewportWidth < 720 ? 0 : (index % 6) * 26 - 52,
                focus: () => openWin(name),
              }}
            >
              {content}
            </WindowStackContext.Provider>
          )
        })}

        {searchOpen && (
          <SearchPanel
            onClose={() => setSearchOpen(false)}
            onOpen={openWin}
            onProject={openProject}
          />
        )}
      </div>

      <nav className="dock" aria-label="Portfolio shortcuts">
        <button
          className="dock-app finder"
          onClick={() => openWin("project")}
          aria-label="Work"
        >
          <DockIcon type="finder" />
        </button>
        <button
          className="dock-app launch"
          onClick={() => openWin("project")}
          aria-label="Launchpad"
        >
          <DockIcon type="grid" />
        </button>
        <button
          className="dock-app safari"
          onClick={() => openWin("safari")}
          aria-label="Safari"
        >
          <DockIcon type="safari" />
        </button>
        <button
          className="dock-app chrome"
          onClick={() => openWin("chrome")}
          aria-label="Chrome"
        >
          <DockIcon type="chrome" />
        </button>
        <button
          className="dock-app maps"
          onClick={() => openWin("maps")}
          aria-label="Maps"
        >
          <DockIcon type="maps" />
        </button>
        <button
          className="dock-app messages"
          onClick={() => openWin("messages")}
          aria-label="Messages"
        >
          <DockIcon type="message" />
        </button>
        <button
          className="dock-app mail"
          onClick={() => openWin("mail")}
          aria-label="Contact"
        >
          <DockIcon type="mail" />
        </button>
        <button
          className="dock-app photos"
          onClick={() => openWin("photos")}
          aria-label="Photos"
        >
          <DockIcon type="photos" />
        </button>
        <span className="dock-divider" />
        <button
          className="dock-app resume"
          onClick={() => openWin("resume")}
          aria-label="Resume"
        >
          <DockIcon type="file" />
        </button>
        <button
          className="dock-app trash"
          onClick={closeTop}
          aria-label="Close current window"
        >
          <DockIcon type="trash" />
        </button>
      </nav>
    </main>
  )
}
