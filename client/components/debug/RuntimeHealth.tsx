const services = [
    { name: 'API Gateway', status: 'Degraded', color: 'text-amber-400 bg-amber-400/10' },
    { name: 'Auth Service', status: 'Warning', color: 'text-amber-400 bg-amber-400/10' },
    { name: 'Database', status: 'At risk', color: 'text-amber-400 bg-amber-400/10' },
    { name: 'Queue Worker', status: 'Healthy', color: 'text-emerald-400 bg-emerald-400/10' },
    { name: 'Cache', status: 'Healthy', color: 'text-emerald-400 bg-emerald-400/10' },
];

export function RuntimeHealth() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Runtime Health</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Current service status</p>
                </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                {services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-neutral-500">{service.name}</span>
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${service.color}`}>
                            {service.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
