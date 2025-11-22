// --- Configuration & Data ---

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
    const badgeCloud = document.getElementById('isCloud');
    const badgeEnt = document.getElementById('isEnterprise');

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

            // Process Data
            const nsRecords = nsData.Answer 
                ? nsData.Answer.filter(r => r.type === 2).map(r => r.data)
                : [];
            
            const ipRecord = aData.Answer 
                ? aData.Answer.find(r => r.type === 1)
                : null;

            const provider = getProviderFromNS(nsRecords);

            // Render
            renderResults(domain, nsRecords, provider, ipRecord ? ipRecord.data : null);

        } catch (err) {
            console.error(err);
            errorMsg.textContent = "Could not resolve domain.";
            errorMsg.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function renderResults(domain, nsRecords, provider, ip) {
        elDomain.textContent = domain;
        elWhois.href = `https://who.is/whois/${domain}`;
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

        // Badges
        badgeCloud.classList.add('hidden');
        badgeEnt.classList.add('hidden');

        if (provider) {
            const enterpriseList = ['Cloudflare', 'Amazon Route 53', 'Google Domains', 'Microsoft Azure', 'NS1 (IBM)', 'UltraDNS', 'Constellix', 'Oracle Dyn', 'CSC Global (Enterprise)', 'MarkMonitor (Enterprise)'];
            const cloudList = ['Cloudflare', 'Amazon Route 53', 'DigitalOcean', 'Vercel', 'Netlify', 'Google Domains', 'Microsoft Azure', 'Alibaba Cloud', 'Tencent Cloud'];

            if (cloudList.includes(provider)) badgeCloud.classList.remove('hidden');
            if (enterpriseList.includes(provider)) badgeEnt.classList.remove('hidden');
        }

        results.classList.remove('hidden');
    }
});
