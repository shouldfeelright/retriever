// --- Configuration & Data ---

const rdapStatusExplanations = {
    'active': 'Domain is active and registered',
    'inactive': 'Domain is inactive',
    'client delete prohibited': 'Domain cannot be deleted by the registrant',
    'client hold': 'Domain is held by registrant (not active)',
    'client renew prohibited': 'Domain cannot be renewed by registrant',
    'client transfer prohibited': 'Domain cannot be transferred to another registrar',
    'client update prohibited': 'Domain information cannot be updated',
    'pending create': 'Domain registration is pending',
    'pending delete': 'Domain deletion is pending',
    'pending renew': 'Domain renewal is pending',
    'pending restore': 'Domain restoration is pending',
    'pending transfer': 'Domain transfer is pending',
    'pending update': 'Domain update is pending',
    'redemption period': 'Domain is in grace period for restoration',
    'renew': 'Domain can be renewed',
    'server delete prohibited': 'Registry prevents domain deletion',
    'server hold': 'Registry has placed hold on domain',
    'server renew prohibited': 'Registry prevents domain renewal',
    'server transfer prohibited': 'Registry prevents domain transfer',
    'server update prohibited': 'Registry prevents domain information updates',
    'transfer': 'Domain can be transferred',
    'update': 'Domain information can be updated',
    'ok': 'No issues detected',
};

const eventActionExplanations = {
    'registration': 'Domain was registered',
    'expiration': 'Domain registration expires',
    'last changed': 'Domain information was last updated',
    'last renewed': 'Domain was last renewed',
    'created': 'Domain was created',
    'updated': 'Domain information was updated',
    'transferred': 'Domain was transferred to new registrar',
    'transfer': 'Domain transfer authorization code was requested',
    'locked': 'Domain lock was enabled',
    'unlocked': 'Domain lock was disabled',
    'purged': 'Domain was purged',
    'renewed': 'Domain was renewed',
    'reactivated': 'Domain was reactivated',
    'deleted': 'Domain was deleted',
    'restored': 'Domain was restored',
    'suspended': 'Domain was suspended',
    'released': 'Domain was released',
    'flagged': 'Domain was flagged',
    'unflagged': 'Domain flag was removed',
    'last update of whois': 'WHOIS information was last updated',
    'last update of RDAP database': 'RDAP database was last updated',
    'last corresp': 'Last correspondence date',
    'last auto renewal': 'Domain was last auto-renewed',
    'enrolled in auto renewal': 'Domain enrolled in auto-renewal',
    'unenrolled from auto renewal': 'Domain unenrolled from auto-renewal',
    'transition': 'Domain transition event',
    'migrated': 'Domain was migrated',
    'initialization': 'Domain initialization',
};

const providerSignatures = {
    'cloudflare.com': 'Cloudflare',
    'awsdns': 'Amazon Route 53',
    'googledomains.com': 'Google Domains',
    'azure-dns': 'Microsoft Azure',
    'godaddy.com': 'GoDaddy',
    'domaincontrol.com': 'GoDaddy',
    'wixdns.net': 'Wix',
    'squarespacedns.com': 'Squarespace',
    'wordpress.com': 'WordPress.com',
    'bluehost.com': 'Bluehost',
    'hostgator.com': 'HostGator',
    'namecheaphosting.com': 'Namecheap',
    'registrar-servers.com': 'Namecheap',
    'siteground.net': 'SiteGround',
    'digitalocean.com': 'DigitalOcean',
    'linode.com': 'Linode (Akamai)',
    'vercel-dns.com': 'Vercel',
    'netlify.com': 'Netlify',
    'ovh.net': 'OVHcloud',
    'hetzner.com': 'Hetzner',
    'rackspace.com': 'Rackspace',
    'dreamhost.com': 'DreamHost',
    'shopify.com': 'Shopify',
    'nsone.net': 'NS1 (IBM)',
    'dynect.net': 'Oracle Dyn',
    'ultradns.net': 'UltraDNS',
    'constellix.com': 'Constellix',
    'dnsmadeeasy.com': 'DNS Made Easy',
    '1and1.com': 'IONOS',
    'ui-dns': 'IONOS',
    'dnsimple.com': 'DNSimple',
    'porkbun.com': 'Porkbun',
    'name-services.com': 'eNom',
    'name.com': 'Name.com',
    'domain.com': 'Domain.com',
    'register.com': 'Register.com',
    'worldnic.com': 'Network Solutions',
    'gandi.net': 'Gandi',
    'hover.com': 'Hover (Tucows)',
    'cscdns': 'CSC Global (Enterprise)',
    'markmonitor': 'MarkMonitor (Enterprise)',
    'safenames': 'Safenames',
    'aliyun': 'Alibaba Cloud',
    'hichina': 'Alibaba Cloud',
    'dnspod': 'Tencent Cloud',
    'cloudflare.net': 'Cloudflare', 
    'bodis': 'Bodis (Parking)',
    'sedoparking': 'Sedo (Parking)',
    'afternic': 'Afternic (Parking)',
    'parkingcrew': 'ParkingCrew',
    'epik': 'Epik',
    'uniregistry': 'Uniregistry',
    'internet.bs': 'Internet.bs',
    'namesilo': 'NameSilo',
    'inmotionhosting': 'InMotion Hosting',
    'a2hosting': 'A2 Hosting',
    'liquidweb': 'Liquid Web',
    'wpengine': 'WP Engine',
    'hostinger': 'Hostinger'
};

// --- Helpers ---

// Validate domain format - stricter security validation
function isValidDomain(domain) {
    if (!domain || typeof domain !== 'string') return false;
    // RFC 1035 domain validation: alphanumeric, hyphens, dots
    // Must start/end with alphanumeric, no consecutive dots
    const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
    return domainRegex.test(domain) && domain.length <= 253;
}

function cleanDomain(url) {
    if (!url) return "";
    let domain = url.toLowerCase().trim();
    domain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    domain = domain.split('/')[0];
    domain = domain.split(':')[0]; // Remove port
    domain = domain.split('?')[0]; // Remove query strings
    domain = domain.split('#')[0]; // Remove fragments
    // Additional sanitization: remove any non-domain characters
    domain = domain.replace(/[^a-z0-9.-]/gi, '');
    return domain;
}

function getProviderFromNS(nsArray) {
    for (let ns of nsArray) {
        for (let key in providerSignatures) {
            if (ns.includes(key)) {
                return providerSignatures[key];
            }
        }
    }
    return null;
}

// Extract authoritative registrar from RDAP response
function extractRegistrarFromRdap(rdapData) {
    if (!rdapData || !Array.isArray(rdapData.entities)) return null;

    const nameFromEntity = (entity) => {
        try {
            const v = entity.vcardArray;
            if (!v || !Array.isArray(v[1])) return null;
            for (const field of v[1]) {
                if (!Array.isArray(field)) continue;
                const key = field[0] && String(field[0]).toLowerCase();
                if (key === 'fn' || key === 'org') {
                    // vcard field format: [ name, params, type, value ]
                    return field[3] || (typeof field[1] === 'string' ? field[1] : null);
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    };

    // Prefer entities that explicitly list the 'registrar' role
    for (const ent of rdapData.entities) {
        if (Array.isArray(ent.roles) && ent.roles.some(r => /registrar/i.test(String(r)))) {
            const n = nameFromEntity(ent);
            if (n) return n;
        }
    }

    // Fallback: any entity with an fn/org
    for (const ent of rdapData.entities) {
        const n = nameFromEntity(ent);
        if (n) return n;
    }

    return null;
}

// --- Main Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm');
    const input = document.getElementById('domainInput');
    const errorMsg = document.getElementById('errorMessage');
    const loader = document.getElementById('loader');
    const results = document.getElementById('results');
    const currentTabBtn = document.getElementById('currentTabBtn');

    // Elements to update
    const elDomain = document.getElementById('resultDomain');
    const elIp = document.getElementById('ipAddress');
    const elProvider = document.getElementById('providerName');
    const elRegistrar = document.getElementById('registrarHint');
    const elRegistrarNote = document.getElementById('registrarNote');
    const elNsList = document.getElementById('nsList');
    const elWhois = document.getElementById('externalWhois');
    const elRdap = document.getElementById('externalRdap');
    const rdapSection = document.getElementById('rdapSection');
    const statusList = document.getElementById('statusList');
    const eventsSection = document.getElementById('eventsSection');
    const eventsList = document.getElementById('eventsList');
    // Accordion content containers (collapsed by default)
    const nsContent = document.getElementById('nsContent');
    const rdapContent = document.getElementById('rdapContent');
    const eventsContent = document.getElementById('eventsContent');
    const rdapToggle = document.getElementById('rdapToggle');

    // Store raw RDAP data for toggle
    let currentRdapData = null;

    // RDAP toggle listener
    rdapToggle.addEventListener('change', () => {
        if (currentRdapData) {
            renderRdapSections(currentRdapData, rdapToggle.checked);
        }
    });

    // Initialize accordion toggle handlers
    const accordionToggles = document.querySelectorAll('.accordion .accordion-toggle');
    accordionToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const content = btn.nextElementSibling; // .accordion-content
            if (!content) return;
            if (expanded) {
                btn.setAttribute('aria-expanded', 'false');
                content.classList.add('hidden');
            } else {
                btn.setAttribute('aria-expanded', 'true');
                content.classList.remove('hidden');
            }
        });
    });

    // Feature: Get Current Tab Domain
    currentTabBtn.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                const domain = cleanDomain(tabs[0].url);
                input.value = domain;
                runScan(domain);
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runScan(input.value);
    });

    async function runScan(rawInput) {
        // Reset UI
        errorMsg.classList.add('hidden');
        results.classList.add('hidden');
        
        const domain = cleanDomain(rawInput);
        // Stricter validation using regex
        if (!domain || !isValidDomain(domain)) {
            errorMsg.textContent = "Please enter a valid domain.";
            errorMsg.classList.remove('hidden');
            return;
        }

        loader.classList.remove('hidden');

        try {
            // Security: Properly encode domain in URL parameters to prevent injection
            const encodedDomain = encodeURIComponent(domain);
            
            // Fetch NS
            const nsResponse = await fetch(`https://dns.google/resolve?name=${encodedDomain}&type=NS`);
            if (!nsResponse.ok) {
                throw new Error(`HTTP ${nsResponse.status}`);
            }
            const nsData = await nsResponse.json();

            // Fetch A (IP)
            const aResponse = await fetch(`https://dns.google/resolve?name=${encodedDomain}&type=A`);
            if (!aResponse.ok) {
                throw new Error(`HTTP ${aResponse.status}`);
            }
            const aData = await aResponse.json();

            if (nsData.Status !== 0) {
                throw new Error("NXDOMAIN");
            }

            // Fetch RDAP - encode domain in path segment
            let rdapData = null;
            try {
                const rdapResponse = await fetch(`https://rdap.org/domain/${encodedDomain}`);
                if (rdapResponse.ok) {
                    rdapData = await rdapResponse.json();
                }
            } catch (rdapErr) {
                console.warn('RDAP fetch failed:', rdapErr);
            }

            // Process Data
            const nsRecords = nsData.Answer 
                ? nsData.Answer.filter(r => r.type === 2).map(r => r.data)
                : [];
            
            const ipRecord = aData.Answer 
                ? aData.Answer.find(r => r.type === 1)
                : null;

            const provider = getProviderFromNS(nsRecords);

            // Store RDAP data for toggle and render
            currentRdapData = rdapData;
            renderResults(domain, nsRecords, provider, ipRecord ? ipRecord.data : null, rdapData);

        } catch (err) {
            // Security: Don't expose internal error details to users
            console.error('Domain lookup error:', err);
            errorMsg.textContent = "Could not resolve domain.";
            errorMsg.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Sanitize text content to prevent XSS
    function sanitizeText(text) {
        if (typeof text !== 'string') return '';
        // Remove any HTML tags and encode special characters
        const div = document.createElement('div');
        div.textContent = text;
        return div.textContent || div.innerText || '';
    }

    function renderResults(domain, nsRecords, provider, ip, rdapData) {
        // Security: Use textContent (already safe) and properly encode URLs
        const sanitizedDomain = sanitizeText(domain);
        elDomain.textContent = sanitizedDomain;
        elDomain.title = sanitizedDomain;
        
        // Security: Properly encode domain in URL paths
        const encodedDomain = encodeURIComponent(domain);
        elWhois.href = `https://who.is/whois/${encodedDomain}`;
        elRdap.href = `https://rdap.org/domain/${encodedDomain}`;
        
        elIp.textContent = sanitizeText(ip || "No A Record");
        // Provider logic (baseline) - Security: Sanitize provider name
        if (provider) {
            elProvider.textContent = sanitizeText(provider);
            elProvider.className = "value text-blue";
        } else {
            elProvider.textContent = "Unknown / Private";
            elProvider.className = "value";
        }

        // Registrar: prefer authoritative RDAP data when available - Security: Sanitize registrar name
        const rdapRegistrar = extractRegistrarFromRdap(rdapData);
        if (rdapRegistrar) {
            elRegistrar.textContent = sanitizeText(rdapRegistrar);
            elRegistrar.className = "value text-purple";
            if (elRegistrarNote) elRegistrarNote.textContent = '';
        } else if (rdapData) {
            // RDAP present but no registrar found
            if (provider) {
                elRegistrar.textContent = `Likely ${sanitizeText(provider)}`;
                elRegistrar.className = "value text-purple";
            } else {
                elRegistrar.textContent = 'Unknown';
                elRegistrar.className = 'value';
            }
            if (elRegistrarNote) elRegistrarNote.textContent = 'Authoritative registrar not present in RDAP response.';
        } else {
            // No RDAP available — fall back to heuristics
            if (provider) {
                elRegistrar.textContent = `Likely ${sanitizeText(provider)}`;
                elRegistrar.className = "value text-purple";
            } else {
                elRegistrar.textContent = 'Check WHOIS';
                elRegistrar.className = 'value';
            }
            if (elRegistrarNote) elRegistrarNote.textContent = 'RDAP unavailable, try WHOIS for authoritative registrar.';
        }

        // NS List - Security: Use textContent instead of innerHTML
        elNsList.innerHTML = '';
        if (nsRecords.length > 0) {
            nsRecords.forEach(ns => {
                const cleanNs = ns.endsWith('.') ? ns.slice(0, -1) : ns;
                const li = document.createElement('li');
                li.textContent = sanitizeText(cleanNs);
                elNsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No records found';
            elNsList.appendChild(li);
        }

        // Render RDAP sections with user-friendly formatting (default)
        renderRdapSections(rdapData, false);

        results.classList.remove('hidden');
    }

    function renderRdapSections(rdapData, showTechnical) {
        // RDAP Statuses
        statusList.innerHTML = '';
        if (rdapData && rdapData.status && rdapData.status.length > 0) {
            // Preserve current accordion state
            const wasRdapExpanded = rdapContent && !rdapContent.classList.contains('hidden');
            
            rdapData.status.forEach(status => {
                const li = document.createElement('li');
                const sanitizedStatus = sanitizeText(String(status));
                if (showTechnical) {
                    li.textContent = sanitizedStatus;
                } else {
                    // Security: Use DOM methods instead of innerHTML
                    const explanation = sanitizeText(rdapStatusExplanations[status] || status);
                    const strong = document.createElement('strong');
                    strong.textContent = sanitizedStatus;
                    const br = document.createElement('br');
                    const span = document.createElement('span');
                    span.className = 'explanation';
                    span.textContent = explanation;
                    li.appendChild(strong);
                    li.appendChild(br);
                    li.appendChild(span);
                }
                statusList.appendChild(li);
            });
            // Show the RDAP accordion header and restore previous state
            rdapSection.classList.remove('hidden');
            if (rdapContent && !wasRdapExpanded) {
                rdapContent.classList.add('hidden');
            } else if (rdapContent && wasRdapExpanded) {
                rdapContent.classList.remove('hidden');
            }
        } else {
            rdapSection.classList.add('hidden');
        }

        // RDAP Events
        eventsList.innerHTML = '';
        if (rdapData && rdapData.events && rdapData.events.length > 0) {
            // Preserve current accordion state
            const wasEventsExpanded = eventsContent && !eventsContent.classList.contains('hidden');
            
            // Sort events by date descending (most recent first)
            const sortedEvents = [...rdapData.events].sort((a, b) => {
                const dateA = new Date(a.eventDate || 0);
                const dateB = new Date(b.eventDate || 0);
                return dateB - dateA;
            });

            sortedEvents.forEach(event => {
                const li = document.createElement('li');
                const action = String(event.eventAction || 'unknown');
                const sanitizedAction = sanitizeText(action);
                const date = event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A';
                
                if (showTechnical) {
                    li.textContent = `${sanitizedAction}: ${date}`;
                } else {
                    // Security: Use DOM methods instead of innerHTML
                    // Use original action for dictionary lookup, sanitize the result for display
                    const explanation = sanitizeText(eventActionExplanations[action] || action);
                    const strong = document.createElement('strong');
                    strong.textContent = date;
                    const br = document.createElement('br');
                    const span = document.createElement('span');
                    span.className = 'explanation';
                    span.textContent = explanation;
                    li.appendChild(strong);
                    li.appendChild(br);
                    li.appendChild(span);
                }
                eventsList.appendChild(li);
            });
            // Show the events accordion header and restore previous state
            eventsSection.classList.remove('hidden');
            if (eventsContent && !wasEventsExpanded) {
                eventsContent.classList.add('hidden');
            } else if (eventsContent && wasEventsExpanded) {
                eventsContent.classList.remove('hidden');
            }
        } else {
            eventsSection.classList.add('hidden');
        }
    }

    // Header control handlers: refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const domain = input.value && input.value.trim();
            if (domain) runScan(domain);
            else window.location.reload();
        });
    }
});
