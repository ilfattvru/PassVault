#!/bin/bash

# Script to remove version numbers from npm imports in UI components

# List of files to process
files=(
  "/components/ui/accordion.tsx"
  "/components/ui/aspect-ratio.tsx"
  "/components/ui/avatar.tsx"
  "/components/ui/breadcrumb.tsx"
  "/components/ui/calendar.tsx"
  "/components/ui/carousel.tsx"
  "/components/ui/chart.tsx"
  "/components/ui/collapsible.tsx"
  "/components/ui/command.tsx"
  "/components/ui/context-menu.tsx"
  "/components/ui/drawer.tsx"
  "/components/ui/form.tsx"
  "/components/ui/hover-card.tsx"
  "/components/ui/input-otp.tsx"
  "/components/ui/menubar.tsx"
  "/components/ui/navigation-menu.tsx"
  "/components/ui/pagination.tsx"
  "/components/ui/radio-group.tsx"
  "/components/ui/resizable.tsx"
  "/components/ui/scroll-area.tsx"
  "/components/ui/separator.tsx"
  "/components/ui/sheet.tsx"
  "/components/ui/sidebar.tsx"
  "/components/ui/sonner.tsx"
  "/components/ui/table.tsx"
  "/components/ui/textarea.tsx"
  "/components/ui/toggle.tsx"
  "/components/ui/toggle-group.tsx"
  "/components/ui/tooltip.tsx"
)

# Replacement patterns
# Remove @version from radix-ui imports
sed -i 's/@radix-ui\/react-[a-z-]*@[0-9.]*/@radix-ui\/react-\1/g' "${files[@]}"

# Remove @version from lucide-react imports
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' "${files[@]}"

# Remove @version from class-variance-authority imports
sed -i 's/class-variance-authority@[0-9.]*/class-variance-authority/g' "${files[@]}"

# Remove @version from other imports
sed -i 's/\(@[^\/]*\/[^@]*\)@[0-9.]*\"/\1\"/g' "${files[@]}"
sed -i 's/\([^@\/]*\)@[0-9.]*\"/\1\"/g' "${files[@]}"

echo "Import versions removed from all UI component files"
