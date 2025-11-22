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
    'last update of rdap': 'RDAP information was last updated',
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

function cleanDomain(url) {
    if (!url) return "";
    let domain = url.toLowerCase().trim();
    domain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    domain = domain.split('/')[0];
    domain = domain.split(':')[0]; // Remove port
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
    const elNsList = document.getElementById('nsList');
    const elWhois = document.getElementById('externalWhois');
    const elRdap = document.getElementById('externalRdap');
    const rdapSection = document.getElementById('rdapSection');
    const statusList = document.getElementById('statusList');
    const eventsSection = document.getElementById('eventsSection');
    const eventsList = document.getElementById('eventsList');
    const rdapToggle = document.getElementById('rdapToggle');

    // Store raw RDAP data for toggle
    let currentRdapData = null;

    // RDAP toggle listener
    rdapToggle.addEventListener('change', () => {
        if (currentRdapData) {
            renderRdapSections(currentRdapData, rdapToggle.checked);
        }
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
        if (!domain || domain.length < 3 || !domain.includes('.')) {
            errorMsg.textContent = "Please enter a valid domain.";
            errorMsg.classList.remove('hidden');
            return;
        }

        loader.classList.remove('hidden');

        try {
            // Fetch NS
            const nsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`);
            const nsData = await nsResponse.json();

            // Fetch A (IP)
            const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
            const aData = await aResponse.json();

            if (nsData.Status !== 0) {
                throw new Error("NXDOMAIN");
            }

            // Fetch RDAP
            let rdapData = null;
            try {
                const rdapResponse = await fetch(`https://rdap.org/domain/${domain}`);
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
            console.error(err);
            errorMsg.textContent = "Could not resolve domain.";
            errorMsg.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function renderResults(domain, nsRecords, provider, ip, rdapData) {
        elDomain.textContent = domain;
        elWhois.href = `https://who.is/whois/${domain}`;
        elRdap.href = `https://rdap.org/domain/${domain}`;
        elIp.textContent = ip || "No A Record";
        // Provider logic
        if (provider) {
            elProvider.textContent = provider;
            elProvider.className = "value text-blue";
            elRegistrar.textContent = "Likely " + provider;
            elRegistrar.className = "value text-purple";
        } else {
            elProvider.textContent = "Unknown / Private";
            elProvider.className = "value";
            elRegistrar.textContent = "Check WHOIS";
            elRegistrar.className = "value";
        }

        // NS List
        elNsList.innerHTML = '';
        if (nsRecords.length > 0) {
            nsRecords.forEach(ns => {
                const cleanNs = ns.endsWith('.') ? ns.slice(0, -1) : ns;
                const li = document.createElement('li');
                li.textContent = cleanNs;
                elNsList.appendChild(li);
            });
        } else {
            elNsList.innerHTML = '<li>No records found</li>';
        }

        // Render RDAP sections with user-friendly formatting (default)
        renderRdapSections(rdapData, false);

        results.classList.remove('hidden');
    }

    function renderRdapSections(rdapData, showTechnical) {
        // RDAP Statuses
        statusList.innerHTML = '';
        if (rdapData && rdapData.status && rdapData.status.length > 0) {
            rdapData.status.forEach(status => {
                const li = document.createElement('li');
                if (showTechnical) {
                    li.textContent = status;
                } else {
                    const explanation = rdapStatusExplanations[status] || status;
                    li.innerHTML = `<strong>${status}</strong><br><span class="explanation">${explanation}</span>`;
                }
                statusList.appendChild(li);
            });
            rdapSection.classList.remove('hidden');
        } else {
            rdapSection.classList.add('hidden');
        }

        // RDAP Events
        eventsList.innerHTML = '';
        if (rdapData && rdapData.events && rdapData.events.length > 0) {
            rdapData.events.forEach(event => {
                const li = document.createElement('li');
                const action = event.eventAction || 'unknown';
                const date = event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A';
                
                if (showTechnical) {
                    li.textContent = `${action}: ${date}`;
                } else {
                    const explanation = eventActionExplanations[action] || action;
                    li.innerHTML = `<strong>${date}</strong><br><span class="explanation">${explanation}</span>`;
                }
                eventsList.appendChild(li);
            });
            eventsSection.classList.remove('hidden');
        } else {
            eventsSection.classList.add('hidden');
        }
    }
});
