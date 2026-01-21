#!/bin/bash

# Script to remove version numbers from npm imports in UI components

# List of files to process
files=(
  "/shared/ui/accordion.tsx"
  "/shared/ui/aspect-ratio.tsx"
  "/shared/ui/avatar.tsx"
  "/shared/ui/breadcrumb.tsx"
  "/shared/ui/calendar.tsx"
  "/shared/ui/carousel.tsx"
  "/shared/ui/chart.tsx"
  "/shared/ui/collapsible.tsx"
  "/shared/ui/command.tsx"
  "/shared/ui/context-menu.tsx"
  "/shared/ui/drawer.tsx"
  "/shared/ui/form.tsx"
  "/shared/ui/hover-card.tsx"
  "/shared/ui/input-otp.tsx"
  "/shared/ui/menubar.tsx"
  "/shared/ui/navigation-menu.tsx"
  "/shared/ui/pagination.tsx"
  "/shared/ui/radio-group.tsx"
  "/shared/ui/resizable.tsx"
  "/shared/ui/scroll-area.tsx"
  "/shared/ui/separator.tsx"
  "/shared/ui/sheet.tsx"
  "/shared/ui/sidebar.tsx"
  "/shared/ui/sonner.tsx"
  "/shared/ui/table.tsx"
  "/shared/ui/textarea.tsx"
  "/shared/ui/toggle.tsx"
  "/shared/ui/toggle-group.tsx"
  "/shared/ui/tooltip.tsx"
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
