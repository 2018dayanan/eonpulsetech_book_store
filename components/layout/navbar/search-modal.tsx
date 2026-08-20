"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

const QUICK_TAGS = [
  { label: "All Books", href: "/search" },
  { label: "Web Development", href: "/search/web-development" },
  { label: "Data Science & AI", href: "/search/data-science-ai" },
  { label: "Python", query: "Python" },
  { label: "JavaScript", query: "JavaScript" },
  { label: "React", query: "React" },
];

export default function SearchModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setSearchValue(searchParams?.get("q") || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close modal on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  const handleTagClick = (tag: (typeof QUICK_TAGS)[number]) => {
    setIsOpen(false);
    if (tag.href) {
      router.push(tag.href);
    } else if (tag.query) {
      router.push(`/search?q=${encodeURIComponent(tag.query)}`);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        aria-label="Search"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
      >
        <MagnifyingGlassIcon className="h-4 transition-all ease-in-out hover:scale-110" />
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={closeModal} className="relative z-50">
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" aria-hidden="true" />
          </Transition.Child>

          {/* Full-Screen Search Panel */}
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 -translate-y-4 scale-98"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-4 scale-98"
          >
            <div className="fixed inset-0 flex flex-col justify-start overflow-y-auto bg-white/95 p-4 sm:p-6 md:p-10 dark:bg-neutral-950/95">
              {/* Header: Title / ESC & Close Button */}
              <div className="mx-auto flex w-full max-w-4xl items-center justify-between pb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Search Bookstore
                </span>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-neutral-400 sm:inline-block">
                    Press <kbd className="rounded border border-neutral-300 px-1.5 py-0.5 font-mono text-[11px] shadow-sm dark:border-neutral-700">ESC</kbd> to close
                  </span>
                  <button
                    onClick={closeModal}
                    aria-label="Close search"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="mx-auto flex w-full max-w-3xl flex-col pt-8 sm:pt-16">
                {/* Search Input Box */}
                <form onSubmit={handleSubmit} className="relative w-full">
                  <div className="relative flex items-center border-b-2 border-neutral-300 pb-4 transition-colors focus-within:border-black dark:border-neutral-700 dark:focus-within:border-white">
                    <MagnifyingGlassIcon className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search for books, topics, authors..."
                      autoComplete="off"
                      className="ml-4 w-full bg-transparent text-xl font-medium text-black placeholder:text-neutral-400 focus:outline-none sm:text-3xl dark:text-white dark:placeholder:text-neutral-600"
                    />
                    {searchValue && (
                      <button
                        type="button"
                        onClick={() => setSearchValue("")}
                        aria-label="Clear input"
                        className="mr-2 text-neutral-400 hover:text-black dark:hover:text-white"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      aria-label="Submit search"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {/* Quick suggestions / Popular searches */}
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Popular Categories & Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Hint Tip */}
                <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
                  💡 <strong>Tip:</strong> Search by book title, author, or category keyword and press <kbd className="rounded border border-neutral-300 px-1 py-0.5 font-mono text-[10px] dark:border-neutral-700">Enter</kbd> to see all matching results.
                </div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black dark:border-neutral-700 dark:text-white">
      <MagnifyingGlassIcon className="h-4" />
    </div>
  );
}
