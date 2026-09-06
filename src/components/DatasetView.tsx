import React, { useState } from 'react';
import { Database, Search, CheckCircle2, AlertTriangle, Play, Download } from 'lucide-react';
import { PredictionLabel } from '../types';

interface DatasetItem {
  id: number;
  title: string;
  text: string;
  label: PredictionLabel;
}

const DATASET_SAMPLES: DatasetItem[] = [
  {
    id: 100,
    title: "Thalapathy Vijay Sworn in as 22nd Chief Minister of Tamil Nadu Following TVK Victory",
    text: "C. Joseph Vijay was officially sworn in as the 22nd Chief Minister of Tamil Nadu on May 10, 2026, after Tamilaga Vettri Kazhagam (TVK) won 108 seats in the 2026 Tamil Nadu Legislative Assembly elections, ending decades of Dravidian party dominance in the state.",
    label: "REAL"
  },
  {
    id: 1,
    title: "NASA James Webb Space Telescope Discovers Oldest Galaxy in Known Universe",
    text: "Astronomers utilizing data from NASA's James Webb Space Telescope have identified JADES-GS-z14-0, a galaxy that existed just 290 million years after the Big Bang. The spectroscopic confirmation reveals unusually bright and massive stellar formations in the early cosmos.",
    label: "REAL"
  },
  {
    id: 2,
    title: "SHOCKING: Secret Underground Alien Base Found Beneath Mount Rushmore by Miners",
    text: "Leaked classified government documents reveal that gold miners accidentally breached a titanium vault beneath Mount Rushmore, exposing extraterrestrial technology and reptilian humanoid cryogenic chambers. Anonymous military sources claim the monument masks alien spacecraft.",
    label: "FAKE"
  },
  {
    id: 3,
    title: "Federal Reserve Holds Benchmark Interest Rates Steady Following Inflation Report",
    text: "The Federal Reserve announced on Wednesday that it will maintain the benchmark federal funds rate in the target range of 5.25% to 5.50%. Fed Chair Jerome Powell stated that while inflation has eased over the past year, further confidence is required before rate cuts.",
    label: "REAL"
  },
  {
    id: 4,
    title: "MIRACLE DOCTOR Reveals Drinking Boiled Banana Peels Cures All Diabetes Overnight",
    text: "A rogue physician who was banned by Big Pharma has exposed an ancient Himalayan secret: drinking warm boiled banana peel tea completely dissolves high blood sugar within 8 hours and reverses insulin resistance permanently.",
    label: "FAKE"
  },
  {
    id: 5,
    title: "World Health Organization Issues Global Update on Avian Influenza Surveillance",
    text: "The World Health Organization (WHO) published its bi-weekly surveillance report on H5N1 avian influenza cases detected in dairy herds and poultry farms. Public health officials reiterated that the current public risk remains low with pasteurization protocols.",
    label: "REAL"
  },
  {
    id: 6,
    title: "Billionaire Tech Mogul Arrested After Neural Microchip Hack Exposes Global Telepathy Network",
    text: "In a stunning midnight raid, federal marshals detained a prominent Silicon Valley CEO after whistleblowers proved that all smartphones manufactured since 2021 emit ultrasonic frequencies that transmit user thoughts directly to private satellite arrays.",
    label: "FAKE"
  },
  {
    id: 7,
    title: "European Union Approves Landmark Artificial Intelligence Regulatory Act",
    text: "The European Parliament voted overwhelmingly to enact the Artificial Intelligence Act, establishing the world's first comprehensive horizontal legal framework for AI governance. The legislation classifies AI applications by risk and bans public biometric tracking.",
    label: "REAL"
  },
  {
    id: 8,
    title: "SCIENTISTS PROVE Earth Is Actually Flat and NASA Moon Landings Were Filmed in Burbank Studio",
    text: "A groundbreaking study conducted by independent truth researchers confirms that curvature calculations are mathematically impossible and Antarctic ice walls prevent ocean waters from spilling over. Declassified archives show Kubrick directed lunar feeds.",
    label: "FAKE"
  },
  {
    id: 9,
    title: "Global Renewable Energy Capacity Surpasses Coal Output in Major Industrial Nations",
    text: "A report from the International Energy Agency (IEA) shows that combined solar photovoltaic and wind energy generation exceeded coal-fired electricity production across the European Union during the second quarter of 2026, driven by record grid installations.",
    label: "REAL"
  },
  {
    id: 10,
    title: "5G Cell Towers Linked to Mass DNA Mutation and Zombie Frequency Mind Control",
    text: "Investigative independent journalists have uncovered classified military frequency tests demonstrating that 5G radiation alters human red blood cell geometry, making citizens susceptible to microwave-based neural command triggers during nocturnal hours.",
    label: "FAKE"
  },
  {
    id: 11,
    title: "United Nations Climate Summit Concludes with Historic Loss and Damage Fund Agreement",
    text: "Delegates from 195 member nations finalized an operational framework for the global Loss and Damage Fund at the UN Climate Summit. Developed economies pledged an initial $700 million to assist climate-vulnerable island nations suffering from sea-level rise.",
    label: "REAL"
  },
  {
    id: 12,
    title: "PROOF: Drinking Pure Bleach Cleanses COVID and Gives 200-Year Longevity",
    text: "A miraculous holistic detox guru with over 10 million followers claims that ingesting industrial disinfectant diluted in saltwater eliminates all known bacterial and viral strains within 15 minutes, boosting cellular rejuvenation past two centuries.",
    label: "FAKE"
  }
];

interface DatasetViewProps {
  onTestSample: (text: string) => void;
}

export const DatasetView: React.FC<DatasetViewProps> = ({ onTestSample }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'REAL' | 'FAKE'>('ALL');

  const filtered = DATASET_SAMPLES.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.text.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || item.label === filter;
    return matchSearch && matchFilter;
  });

  const handleDownloadCSV = () => {
    const headers = ['id', 'title', 'text', 'label'];
    const rows = DATASET_SAMPLES.map(d => [
      d.id,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.text.replace(/"/g, '""')}"`,
      d.label
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'news.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Dataset Explorer (<code className="text-sm font-mono text-blue-600">dataset/news.csv</code>)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Curated ground-truth news corpus used for TF-IDF training and Logistic Regression evaluation.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download news.csv</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dataset titles or keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Samples ({DATASET_SAMPLES.length})
          </button>
          <button
            onClick={() => setFilter('REAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filter === 'REAL' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            Real News ({DATASET_SAMPLES.filter(d => d.label === 'REAL').length})
          </button>
          <button
            onClick={() => setFilter('FAKE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filter === 'FAKE' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            Fake News ({DATASET_SAMPLES.filter(d => d.label === 'FAKE').length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => {
          const isReal = item.label === 'REAL';
          return (
            <div
              key={item.id}
              className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                isReal ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    Sample #{item.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                      isReal
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isReal ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                    <span>{item.label}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.text}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.text.split(' ').length} words
                </span>
                <button
                  onClick={() => onTestSample(`${item.title}\n\n${item.text}`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test in Analyzer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
