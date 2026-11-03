import {
  File,
  FileCode,
  FileCog,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A package or project layout, drawn as a tree that always shows every entry.
 * Use `TreeFolder` and `TreeFile` inside it:
 *
 * ```mdx
 * <FileTree>
 *   <TreeFolder name="as2_example">
 *     <TreeFile name="package.xml" note="Dependencies and metadata" />
 *   </TreeFolder>
 * </FileTree>
 * ```
 */
export function FileTree({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "not-prose my-6 overflow-x-auto rounded-xl border bg-fd-card p-2 font-mono text-[0.8125rem]",
        className,
      )}
    >
      {children}
    </ul>
  );
}

const ROW = "flex min-w-max items-center gap-2 px-2 py-1";

function Note({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <span className="ms-3 font-sans text-xs text-fd-muted-foreground">
      {children}
    </span>
  );
}

/** A folder, with its contents indented under it. */
export function TreeFolder({
  name,
  note,
  children,
}: {
  name: string;
  note?: ReactNode;
  children?: ReactNode;
}) {
  const Icon = children ? FolderOpen : Folder;
  return (
    <li>
      <div className={cn(ROW, "text-fd-foreground")}>
        <Icon className="size-4 shrink-0 text-fd-primary" />
        <span>{name}/</span>
        <Note>{note}</Note>
      </div>
      {children ? <ul className="ms-4 border-s ps-2">{children}</ul> : null}
    </li>
  );
}

/** Picks an icon from the file name: source, configuration, docs or other. */
function iconFor(name: string) {
  if (/\.(c|cc|cpp|cxx|h|hh|hpp|py|sh)$/.test(name)) return FileCode;
  if (/(^CMakeLists\.txt$|\.(xml|toml|cfg|ini|yaml|yml|json))$/.test(name))
    return FileCog;
  if (/\.(md|rst|txt)$/.test(name)) return FileText;
  return File;
}

/** A file. */
export function TreeFile({ name, note }: { name: string; note?: ReactNode }) {
  const Icon = iconFor(name);
  return (
    <li className={cn(ROW, "text-fd-foreground/90")}>
      <Icon className="size-4 shrink-0 text-fd-muted-foreground" />
      <span>{name}</span>
      <Note>{note}</Note>
    </li>
  );
}
