"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { motion, AnimatePresence, type Transition } from "framer-motion"

import { cn } from "@/lib/utils"

const Drawer = DialogPrimitive.Root

const DrawerTrigger = DialogPrimitive.Trigger

const DrawerClose = DialogPrimitive.Close

const DrawerPortal = DialogPrimitive.Portal

// Animation configuration - consistent with codebase style
const DRAWER_TRANSITION: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 0.5,
}

const OVERLAY_TRANSITION: Transition = {
  duration: 0.2,
  ease: "easeOut",
}

interface DrawerOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    asChild
    {...props}
  >
    <motion.div
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={OVERLAY_TRANSITION}
    />
  </DialogPrimitive.Overlay>
))
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  open?: boolean
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, open, ...props }, ref) => {
  const [drawerHeight, setDrawerHeight] = React.useState<number | undefined>(undefined)

  // Capture initial viewport height when drawer opens to prevent resize from keyboard
  React.useEffect(() => {
    if (open) {
      // Use 85% of the initial viewport height, but cap at reasonable max
      const initialHeight = Math.min(window.innerHeight * 0.85, 600)
      setDrawerHeight(initialHeight)
    }
  }, [open])

  return (
    <DrawerPortal>
      <AnimatePresence>
        {open && (
          <>
            <DialogPrimitive.Overlay
              asChild
              forceMount
              key="drawer-overlay"
            >
              <motion.div
                className={cn(
                  "fixed inset-0 z-50 bg-black/50"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={OVERLAY_TRANSITION}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              ref={ref}
              asChild
              forceMount
              key="drawer-content"
              {...props}
            >
              <motion.div
                className={cn(
                  "fixed z-50 bg-white shadow-lg flex flex-col",
                  "inset-x-0 bottom-0 border-t border-slate-200 rounded-t-[1.5rem]",
                  className
                )}
                style={{
                  height: drawerHeight ? `${drawerHeight}px` : undefined,
                  maxHeight: drawerHeight ? `${drawerHeight}px` : '85vh',
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={DRAWER_TRANSITION}
              >
                {/* Drag handle indicator */}
                <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300 mb-2 mt-3 shrink-0" />
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </>
        )}
      </AnimatePresence>
    </DrawerPortal>
  )
})
DrawerContent.displayName = DialogPrimitive.Content.displayName

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-foreground",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DialogPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DialogPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

