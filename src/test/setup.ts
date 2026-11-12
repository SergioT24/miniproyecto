import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { server } from "./msw/server"

beforeAll(() => {
  server.listen({
    onUnhandledRequest(request, print) {
      const { pathname } = new URL(request.url)
      if (pathname.startsWith("/api/")) {
        print.error()
      }
    },
  })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// jsdom no implementa estas APIs que usan los primitives de Base UI y el theme provider.
const mediaQueryList = {
  matches: false,
  media: "",
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(() => false),
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn(() => mediaQueryList),
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub)

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ""
  readonly thresholds = []

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub)

Element.prototype.scrollIntoView = vi.fn()
Element.prototype.hasPointerCapture = vi.fn(() => false)
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
