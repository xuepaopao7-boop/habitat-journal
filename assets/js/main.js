const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.querySelector("[data-primary-nav]");

if (navToggle && primaryNav) {
  const closeNavigation = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !expanded);
    document.body.classList.toggle("menu-open", !expanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
      closeNavigation();
      navToggle.focus();
    }
  });
}

if (primaryNav) {
  if (window.location.pathname.startsWith("/articles/")) {
    primaryNav.querySelectorAll("a[aria-current]").forEach((link) => {
      link.removeAttribute("aria-current");
    });
    primaryNav
      .querySelector('a[href="/stories/"]')
      ?.setAttribute("aria-current", "location");
  }

  const homeLink = primaryNav.querySelector('a[href="/"]');
  const sectionLinks = ["stories", "topics"]
    .map((id) => ({
      id,
      section: document.getElementById(id),
      link: primaryNav.querySelector(`a[href="#${id}"]`),
    }))
    .filter(({ section, link }) => section && link);

  if (homeLink && sectionLinks.length) {
    const trackedLinks = [homeLink, ...sectionLinks.map(({ link }) => link)];
    let activeLink = null;
    let scrollFrame = null;

    const setActiveLink = (nextLink) => {
      if (!nextLink || nextLink === activeLink) return;

      trackedLinks.forEach((link) => link.removeAttribute("aria-current"));
      nextLink.setAttribute(
        "aria-current",
        nextLink === homeLink ? "page" : "location"
      );
      activeLink = nextLink;
    };

    const updateActiveLink = () => {
      scrollFrame = null;
      const headerHeight =
        document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
      const readingLine =
        window.scrollY + headerHeight + Math.min(window.innerHeight * 0.18, 150);
      let nextLink = homeLink;

      sectionLinks.forEach(({ section, link }) => {
        if (section.offsetTop <= readingLine) {
          nextLink = link;
        }
      });

      setActiveLink(nextLink);
    };

    const requestActiveLinkUpdate = () => {
      if (scrollFrame === null) {
        scrollFrame = window.requestAnimationFrame(updateActiveLink);
      }
    };

    sectionLinks.forEach(({ link }) => {
      link.addEventListener("click", () => setActiveLink(link));
    });

    homeLink.addEventListener("click", () => setActiveLink(homeLink));
    window.addEventListener("scroll", requestActiveLinkUpdate, { passive: true });
    window.addEventListener("resize", requestActiveLinkUpdate);
    window.addEventListener("hashchange", requestActiveLinkUpdate);
    window.addEventListener("load", requestActiveLinkUpdate);
    requestActiveLinkUpdate();
  }
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent(data.get("subject") || "Habitat Journal enquiry");
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:editor@habitatjournal.com?subject=${subject}&body=${body}`;
  });
}
