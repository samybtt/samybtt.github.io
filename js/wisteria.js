// Wisteria divider animation — draws once, then sways permanently
(function () {
    const canvas = document.getElementById('wisteria-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    function resize() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Timing — draw-in phase only, no fade
    const PHASE_MAIN = [0, 1.8];
    const PHASE_SUB = [1.2, 3.2];
    const PHASE_LEAVES = [2.5, 4.5];
    const PHASE_FLOWERS = [3.5, 6.5];
    const DRAW_DONE = 6.5;

    function progress(time, start, end) {
        if (time < start) return 0;
        if (time > end) return 1;
        return (time - start) / (end - start);
    }

    // Seeded random
    let seed;
    function srand() {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function getBranchColor() {
        return isDark() ? '#a89880' : '#8B7355';
    }

    function getStemColor() {
        return isDark() ? '#b8a890' : '#9B8B6B';
    }

    function getLeafColors() {
        return isDark() ? ['#6aad5a', '#88cc78'] : ['#7BA05B', '#9BBB7A'];
    }

    function getFlowerColors() {
        return isDark()
            ? { main: ['#c8a8e8', '#e0c8f8', '#a890c0'], center: '#f0e0ff' }
            : { main: ['#B8A0D0', '#D0B8E8', '#9080B0'], center: '#E8D8F4' };
    }

    function generateScene() {
        seed = 12345;
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        const scene = { mainBranch: null, subBranches: [], leaves: [], flowerClusters: [] };

        scene.mainBranch = {
            x0: w * 0.02, y0: h * 0.2,
            cx1: w * 0.25, cy1: h * 0.08,
            cx2: w * 0.6, cy2: h * 0.15,
            x1: w * 0.98, y1: h * 0.18,
            thickness: Math.max(3, w * 0.005)
        };

        function mainPt(t) {
            const b = scene.mainBranch, u = 1 - t;
            return {
                x: u*u*u*b.x0 + 3*u*u*t*b.cx1 + 3*u*t*t*b.cx2 + t*t*t*b.x1,
                y: u*u*u*b.y0 + 3*u*u*t*b.cy1 + 3*u*t*t*b.cy2 + t*t*t*b.y1
            };
        }

        function mainTangent(t) {
            const b = scene.mainBranch, u = 1 - t;
            const dx = 3*u*u*(b.cx1-b.x0) + 6*u*t*(b.cx2-b.cx1) + 3*t*t*(b.x1-b.cx2);
            const dy = 3*u*u*(b.cy1-b.y0) + 6*u*t*(b.cy2-b.cy1) + 3*t*t*(b.y1-b.cy2);
            const len = Math.sqrt(dx*dx+dy*dy);
            return { dx: dx/len, dy: dy/len };
        }

        // More sub-branches, scaled to screen width
        const subCount = Math.max(8, Math.floor(w / 60));
        for (let i = 0; i < subCount; i++) {
            const t = 0.05 + (i / subCount) * 0.9 + (srand() - 0.5) * 0.08;
            const pt = mainPt(t);
            const tang = mainTangent(t);
            const angle = Math.atan2(tang.dy, tang.dx) + (0.3 + srand() * 0.8);
            const len = w * (0.03 + srand() * 0.06);
            scene.subBranches.push({
                mainT: t,
                sx: pt.x, sy: pt.y,
                cx: pt.x + Math.cos(angle) * len * 0.5 + (srand()-0.5) * len * 0.3,
                cy: pt.y + Math.sin(angle) * len * 0.5 + srand() * len * 0.2,
                ex: pt.x + Math.cos(angle) * len,
                ey: pt.y + Math.sin(angle) * len,
                thickness: Math.max(1.5, scene.mainBranch.thickness * (0.3 + srand() * 0.3)),
                delay: srand() * 0.3
            });
        }

        // Leaves
        function addLeaves(points, count) {
            for (let i = 0; i < count; i++) {
                const t = 0.1 + srand() * 0.85;
                const pt = points[Math.min(Math.floor(t * (points.length-1)), points.length-1)];
                scene.leaves.push({
                    x: pt.x + (srand()-0.5) * 6,
                    y: pt.y + (srand()-0.5) * 6,
                    angle: -Math.PI*0.3 + srand()*Math.PI*0.6 + Math.PI*0.5,
                    size: w * (0.006 + srand() * 0.008),
                    colorIdx: srand() > 0.5 ? 0 : 1,
                    delay: srand() * 0.4
                });
            }
        }

        const mainPts = [];
        for (let i = 0; i <= 30; i++) mainPts.push(mainPt(i/30));
        addLeaves(mainPts, 15 + Math.floor(srand() * 8));

        for (const sb of scene.subBranches) {
            const pts = [];
            for (let i = 0; i <= 8; i++) {
                const t = i/8, u = 1-t;
                pts.push({ x: u*u*sb.sx+2*u*t*sb.cx+t*t*sb.ex, y: u*u*sb.sy+2*u*t*sb.cy+t*t*sb.ey });
            }
            addLeaves(pts, 2 + Math.floor(srand() * 3));
        }

        // More flower clusters, scaled to width
        const clusterCount = Math.max(10, Math.floor(w / 50));
        for (let i = 0; i < clusterCount; i++) {
            let ax, ay;
            // Evenly space clusters along the branch, then jitter
            const baseT = 0.05 + (i / clusterCount) * 0.9 + (srand() - 0.5) * 0.06;
            if (i < scene.subBranches.length && srand() > 0.2) {
                const sb = scene.subBranches[i % scene.subBranches.length];
                const t = 0.5 + srand() * 0.5, u = 1-t;
                ax = u*u*sb.sx+2*u*t*sb.cx+t*t*sb.ex;
                ay = u*u*sb.sy+2*u*t*sb.cy+t*t*sb.ey;
            } else {
                const pt = mainPt(Math.max(0.05, Math.min(0.95, baseT)));
                ax = pt.x + (srand()-0.5)*8;
                ay = pt.y;
            }

            const flowerCount = 12 + Math.floor(srand() * 18);
            const clusterLen = h * (0.3 + srand() * 0.4);
            const flowers = [];
            for (let f = 0; f < flowerCount; f++) {
                const ft = f / flowerCount;
                const spread = (1 - ft*0.7) * w * 0.012;
                const colorIdx = srand() < 0.4 ? 0 : srand() < 0.7 ? 1 : 2;
                flowers.push({
                    ox: (srand()-0.5) * spread * 2,
                    oy: ft * clusterLen,
                    size: w * (0.002 + (1-ft)*0.003) * (0.7+srand()*0.6),
                    colorIdx,
                    delay: srand()*0.3 + ft*0.3
                });
            }

            scene.flowerClusters.push({
                ax, ay, flowers, clusterLen,
                delay: srand() * 0.5,
                swayPhase: srand() * Math.PI * 2,
                swayAmp: 1.5 + srand() * 2.5
            });
        }

        return scene;
    }

    let scene;
    let startTime = null;
    let running = false;
    let drawComplete = false;

    function drawBezier(x0,y0,cx1,cy1,cx2,cy2,x1,y1,prog,thick) {
        if (prog <= 0) return;
        const p = easeInOutCubic(prog);
        ctx.beginPath();
        ctx.moveTo(x0,y0);
        const steps = 40;
        for (let i = 1; i <= Math.floor(p*steps); i++) {
            const t = i/steps, u = 1-t;
            ctx.lineTo(u*u*u*x0+3*u*u*t*cx1+3*u*t*t*cx2+t*t*t*x1, u*u*u*y0+3*u*u*t*cy1+3*u*t*t*cy2+t*t*t*y1);
        }
        ctx.strokeStyle = getBranchColor();
        ctx.lineWidth = thick;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function drawQuad(sx,sy,cx,cy,ex,ey,prog,thick) {
        if (prog <= 0) return;
        const p = easeOutCubic(prog);
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        const steps = 15;
        for (let i = 1; i <= Math.floor(p*steps); i++) {
            const t = i/steps, u = 1-t;
            ctx.lineTo(u*u*sx+2*u*t*cx+t*t*ex, u*u*sy+2*u*t*cy+t*t*ey);
        }
        ctx.strokeStyle = getBranchColor();
        ctx.lineWidth = thick;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function drawLeaf(x,y,angle,size,colorIdx,prog) {
        if (prog <= 0) return;
        const s = easeOutCubic(prog) * size;
        const colors = getLeafColors();
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(angle);
        ctx.scale(s,s);
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.bezierCurveTo(1.2,-0.5,2,-0.3,3,0);
        ctx.bezierCurveTo(2,0.3,1.2,0.5,0,0);
        ctx.fillStyle = colors[colorIdx];
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function drawFlower(x,y,size,colorIdx,prog) {
        if (prog <= 0) return;
        const s = easeOutCubic(prog) * size;
        if (s < 0.3) return;
        const fc = getFlowerColors();
        ctx.save();
        ctx.translate(x,y);
        ctx.globalAlpha = 0.8 * Math.min(1, prog*2);
        ctx.fillStyle = fc.main[colorIdx];
        for (let p = 0; p < 4; p++) {
            ctx.beginPath();
            ctx.ellipse(Math.cos(p*Math.PI/2)*s*0.3, Math.sin(p*Math.PI/2)*s*0.3, s*0.7, s*0.45, p*Math.PI/2, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0,0,s*0.25,0,Math.PI*2);
        ctx.fillStyle = fc.center;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function render(timestamp) {
        if (!running) return;
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        // Clamp cycleTime — once drawing is done, stay at DRAW_DONE
        const cycleTime = drawComplete ? DRAW_DONE : Math.min(elapsed, DRAW_DONE);
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        if (cycleTime >= DRAW_DONE) drawComplete = true;

        ctx.clearRect(0, 0, w, h);

        // Main branch — always fully drawn once complete
        const mp = progress(cycleTime, PHASE_MAIN[0], PHASE_MAIN[1]);
        const mb = scene.mainBranch;
        drawBezier(mb.x0,mb.y0,mb.cx1,mb.cy1,mb.cx2,mb.cy2,mb.x1,mb.y1,mp,mb.thickness);

        // Sub-branches
        const sp = progress(cycleTime, PHASE_SUB[0], PHASE_SUB[1]);
        for (const sb of scene.subBranches) {
            if (mp < sb.mainT) continue;
            const p = Math.max(0, Math.min(1, (sp-sb.delay)/(1-sb.delay)));
            drawQuad(sb.sx,sb.sy,sb.cx,sb.cy,sb.ex,sb.ey,p,sb.thickness);
        }

        // Leaves
        const lp = progress(cycleTime, PHASE_LEAVES[0], PHASE_LEAVES[1]);
        for (const leaf of scene.leaves) {
            const p = Math.max(0, Math.min(1, (lp-leaf.delay)/(1-leaf.delay)));
            drawLeaf(leaf.x,leaf.y,leaf.angle,leaf.size,leaf.colorIdx,p);
        }

        // Flowers — always sway once visible, use real elapsed for continuous sway
        const fp = progress(cycleTime, PHASE_FLOWERS[0], PHASE_FLOWERS[1]);
        const swayT = elapsed;

        for (const cluster of scene.flowerClusters) {
            const cp = Math.max(0, Math.min(1, (fp-cluster.delay)/(1-cluster.delay)));
            if (cp <= 0) continue;

            // Gentle calm wind sway — always active once flowers appear
            let swayX = 0;
            if (cp > 0.3) {
                const str = Math.min(1, (cp - 0.3) / 0.7);
                swayX = Math.sin(swayT * 1.57 + cluster.swayPhase) * cluster.swayAmp * str;
            }

            const stemLen = cluster.clusterLen * easeOutCubic(Math.min(1, cp*1.5));
            ctx.beginPath();
            ctx.moveTo(cluster.ax, cluster.ay);
            ctx.quadraticCurveTo(cluster.ax+swayX*0.5, cluster.ay+stemLen*0.5, cluster.ax+swayX, cluster.ay+stemLen);
            ctx.strokeStyle = getStemColor();
            ctx.lineWidth = 1;
            ctx.stroke();

            for (const fl of cluster.flowers) {
                const flp = Math.max(0, Math.min(1, (cp-fl.delay*0.5)/(1-fl.delay*0.5)));
                if (flp <= 0) continue;
                const ratio = fl.oy / cluster.clusterLen;
                drawFlower(cluster.ax+fl.ox+swayX*ratio, cluster.ay+fl.oy*easeOutCubic(Math.min(1,cp*1.5)), fl.size, fl.colorIdx, flp);
            }
        }

        requestAnimationFrame(render);
    }

    // Trigger on scroll into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !running) {
                resize();
                scene = generateScene();
                running = true;
                drawComplete = false;
                startTime = null;
                requestAnimationFrame(render);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);

    window.addEventListener('resize', () => {
        resize();
        scene = generateScene();
        // If already drawn, keep it complete
        if (drawComplete) drawComplete = true;
    });

    // Redraw on theme change
    const themeObs = new MutationObserver(() => {
        scene = generateScene();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
