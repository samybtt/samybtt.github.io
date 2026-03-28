// Small green plant sprouts along the about section edges
(function () {
    const section = document.querySelector('.about-decorated');
    if (!section) return;

    function seededRandom(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const greensLight = [
        { stem: '#4a8c5c', leaf: '#5fa872' },
        { stem: '#3d7a4f', leaf: '#6fbf82' },
        { stem: '#2e6b40', leaf: '#52b06a' },
        { stem: '#5a9e6e', leaf: '#7cc98e' },
    ];

    const greensDark = [
        { stem: '#6bcf88', leaf: '#8ae4a2' },
        { stem: '#5ec47a', leaf: '#7edda0' },
        { stem: '#50b86c', leaf: '#72d690' },
        { stem: '#7ad898', leaf: '#9aeab4' },
    ];

    function getGreens() {
        return isDark() ? greensDark : greensLight;
    }

    // Creates an upward-growing sprout SVG (root at bottom)
    function createSproutUp(height, rand) {
        const g = getGreens();
        const color = g[Math.floor(rand() * g.length)];
        const h = height;
        const leafSize = 5 + rand() * 4;
        const leafAngle = 20 + rand() * 25;
        const hasSecondLeaf = rand() > 0.3;
        const stemCurve = (rand() - 0.5) * 4;
        const ox = 10;

        let svg = `<svg width="20" height="${h}" viewBox="0 0 20 ${h}" xmlns="http://www.w3.org/2000/svg">`;

        // Stem from bottom to top
        svg += `<path d="M${ox} ${h} Q${ox + stemCurve} ${h * 0.5} ${ox} 0"
            stroke="${color.stem}" stroke-width="1" fill="none" opacity="0.6"/>`;

        // Leaves (positioned from top, so low y = near tip)
        function addLeaf(fraction, side, size) {
            const ly = h * (1 - fraction);
            const angle = side * leafAngle;
            svg += `<ellipse cx="${ox + side * size * 0.6}" cy="${ly}"
                rx="${size}" ry="${size * 0.45}"
                fill="${color.leaf}" opacity="0.45"
                transform="rotate(${angle} ${ox + side * size * 0.6} ${ly})"/>`;
        }

        addLeaf(0.3 + rand() * 0.2, 1, leafSize);
        if (hasSecondLeaf) {
            addLeaf(0.55 + rand() * 0.15, -1, leafSize * 0.85);
        }

        // Tip bud
        svg += `<circle cx="${ox + stemCurve * 0.3}" cy="2" r="${1.2 + rand()}"
            fill="${color.leaf}" opacity="0.5"/>`;

        svg += '</svg>';
        return svg;
    }

    // Creates a downward-growing sprout SVG (root at top)
    function createSproutDown(height, rand) {
        const g = getGreens();
        const color = g[Math.floor(rand() * g.length)];
        const h = height;
        const leafSize = 5 + rand() * 4;
        const leafAngle = 20 + rand() * 25;
        const hasSecondLeaf = rand() > 0.3;
        const stemCurve = (rand() - 0.5) * 4;
        const ox = 10;

        let svg = `<svg width="20" height="${h}" viewBox="0 0 20 ${h}" xmlns="http://www.w3.org/2000/svg">`;

        // Stem from top to bottom
        svg += `<path d="M${ox} 0 Q${ox + stemCurve} ${h * 0.5} ${ox} ${h}"
            stroke="${color.stem}" stroke-width="1" fill="none" opacity="0.6"/>`;

        function addLeaf(fraction, side, size) {
            const ly = h * fraction;
            const angle = side * leafAngle * -1;
            svg += `<ellipse cx="${ox + side * size * 0.6}" cy="${ly}"
                rx="${size}" ry="${size * 0.45}"
                fill="${color.leaf}" opacity="0.45"
                transform="rotate(${angle} ${ox + side * size * 0.6} ${ly})"/>`;
        }

        addLeaf(0.3 + rand() * 0.2, 1, leafSize);
        if (hasSecondLeaf) {
            addLeaf(0.55 + rand() * 0.15, -1, leafSize * 0.85);
        }

        // Tip bud
        svg += `<circle cx="${ox + stemCurve * 0.3}" cy="${h - 2}" r="${1.2 + rand()}"
            fill="${color.leaf}" opacity="0.5"/>`;

        svg += '</svg>';
        return svg;
    }

    function createTopSprouts() {
        const container = document.createElement('div');
        container.className = 'sprout-container top';

        const rand = seededRandom(77);
        const sectionWidth = section.offsetWidth;
        const count = Math.floor(sectionWidth / 50) + 3;

        for (let i = 0; i < count; i++) {
            const sprout = document.createElement('div');
            sprout.className = 'sprout top-sprout';

            const x = (i / count) * sectionWidth + (rand() - 0.5) * 30;
            const height = 18 + rand() * 22;

            sprout.innerHTML = createSproutDown(height, rand);
            sprout.style.left = `${x}px`;
            sprout.style.animationDelay = `${rand() * 1.5}s`;
            sprout.querySelector('svg').style.animationDelay = `${rand() * 3}s`;

            container.appendChild(sprout);
        }

        section.appendChild(container);
    }

    function createBottomSprouts() {
        const rand = seededRandom(42);
        const sectionWidth = section.offsetWidth;
        const count = Math.floor(sectionWidth / 50) + 3;

        for (let i = 0; i < count; i++) {
            const sprout = document.createElement('div');
            sprout.className = 'sprout bottom-sprout';

            const x = (i / count) * sectionWidth + (rand() - 0.5) * 30;
            const height = 18 + rand() * 22;

            sprout.innerHTML = createSproutUp(height, rand);
            sprout.style.position = 'absolute';
            sprout.style.left = `${x}px`;
            sprout.style.bottom = '0px';
            sprout.style.animationDelay = `${rand() * 1.5}s`;
            sprout.querySelector('svg').style.animationDelay = `${rand() * 3}s`;

            section.appendChild(sprout);
        }
    }

    function drawAll() {
        section.querySelectorAll('.sprout-container, .bottom-sprout').forEach(c => c.remove());
        createTopSprouts();
        createBottomSprouts();
    }

    // Wait for section to be visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                drawAll();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(section);

    // Redraw on theme change
    const themeObserver = new MutationObserver(drawAll);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
