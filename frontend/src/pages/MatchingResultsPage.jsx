import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { exchangeApi } from '../api/client';
import { MatchScore } from '../components/MatchScore';
import { StatusBadge } from '../components/StatusBadge';
import { RequestModal } from '../components/RequestModal';
import { 
  Sparkles, 
  Layers, 
  MapPin, 
  Scale, 
  DollarSign, 
  Building2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  RefreshCw,
  Server
} from 'lucide-react';

export const MatchingResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReqId = searchParams.get('requirementId');

  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedResourceForProposal, setSelectedResourceForProposal] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // 1. Fetch company's requirements
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await exchangeApi.get('/api/requirements');
        if (res.data.success) {
          const list = res.data.data || [];
          setRequirements(list);
          if (list.length > 0) {
            if (activeReqId) {
              const matched = list.find((r) => (r._id || r.id) === activeReqId);
              setSelectedRequirement(matched || list[0]);
            } else {
              setSelectedRequirement(list[0]);
              setSearchParams({ requirementId: list[0]._id || list[0].id });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load requirements:', err);
      } finally {
        setLoadingReqs(false);
      }
    };

    fetchRequirements();
  }, [activeReqId, setSearchParams]);

  // 2. Fetch matches when selectedRequirement changes
  useEffect(() => {
    if (!selectedRequirement) return;

    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const reqId = selectedRequirement._id || selectedRequirement.id;
        const res = await exchangeApi.get(`/api/matches/${reqId}`);
        if (res.data.success) {
          const rawMatches = res.data.data?.matches || (Array.isArray(res.data.data) ? res.data.data : []);
          setMatches(rawMatches);
        }
      } catch (err) {
        console.error('Failed to fetch circular matches:', err);
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedRequirement]);

  const handleSelectRequirement = (req) => {
    setSelectedRequirement(req);
    setSearchParams({ requirementId: req._id || req.id });
  };

  const handleOpenProposal = (resource) => {
    setSelectedResourceForProposal(resource);
    setRequestModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-teal-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Circular Symbiosis Matching Engine
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-criteria matching evaluating category, available volumes, condition grade, logistics proximity, and rate alignment
            </p>
          </div>

          <Link
            to="/requirements/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
          >
            <span>+ Post Another Requirement</span>
          </Link>
        </div>
      </div>

      {/* Main Layout: Requirements on left (1 col), Matches on right (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Requirements Selector */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Procurement Needs
            </span>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {requirements.length} Active
            </span>
          </div>

          {loadingReqs ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading procurement needs...</div>
          ) : requirements.length > 0 ? (
            <div className="space-y-2">
              {requirements.map((req) => {
                const reqId = req._id || req.id;
                const isSelected = selectedRequirement && (selectedRequirement._id || selectedRequirement.id) === reqId;

                return (
                  <button
                    key={reqId}
                    type="button"
                    onClick={() => handleSelectRequirement(req)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 line-clamp-1">{req.materialTitle}</span>
                      <span className="text-[10px] text-teal-800 font-semibold bg-white px-1.5 py-0.5 rounded border border-teal-200">
                        {req.requiredQuantity} {req.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{req.materialCategory}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{req.deliveryLocation?.city || 'Regional Hub'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p>No material requirements posted yet.</p>
              <Link
                to="/requirements/new"
                className="inline-block px-3 py-1.5 bg-teal-600 text-white rounded text-xs font-semibold"
              >
                Post First Need
              </Link>
            </div>
          )}

          {/* Inter-Service Explainer */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border">
            <div className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
              <Server className="w-3.5 h-3.5 text-teal-600" />
              <span>Real REST Coordination</span>
            </div>
            The Exchange Service queries the Resource Service over HTTP REST to evaluate live unreserved volumes and grade compatibility in real time.
          </div>
        </div>

        {/* Right Column: Matched Candidate Listings */}
        <div className="lg:col-span-3 space-y-4">
          {selectedRequirement && (
            <div className="bg-navy-950 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                  Target Procurement Need
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedRequirement.materialTitle} ({selectedRequirement.requiredQuantity} {selectedRequirement.unit})
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Category: <span className="text-teal-300 font-semibold">{selectedRequirement.materialCategory}</span> • Dest: {selectedRequirement.deliveryLocation?.city}, {selectedRequirement.deliveryLocation?.state}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Max Budget</span>
                <span className="text-sm font-bold text-emerald-400">
                  ₹{selectedRequirement.maxBudgetPerUnit || 0} / {selectedRequirement.unit}
                </span>
              </div>
            </div>
          )}

          {/* Matches List */}
          {loadingMatches ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 animate-pulse">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-teal-600 animate-spin" />
              <p className="text-xs font-semibold">Running multi-factor circular matching algorithm over REST...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Found <strong className="text-slate-900">{matches.length}</strong> compatible industrial resource candidates
                </span>
                <span className="text-teal-700 font-semibold">Sorted by Compatibility Score</span>
              </div>

              {matches.map((matchItem) => {
                const resource = matchItem.resource;
                const score = matchItem.compatibilityScore || 0;
                const factors = matchItem.factors || [];

                return (
                  <div
                    key={resource._id || resource.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 group"
                  >
                    {/* Top Row: Score & Material Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/resources/${resource._id || resource.id}`}
                            className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors"
                          >
                            {resource.title}
                          </Link>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {resource.resourceType || 'By-product'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">
                            {resource.supplierCompanyDisplayName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {resource.pickupLocation?.city}, {resource.pickupLocation?.state}
                          </span>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-2">
                        <MatchScore score={score} />
                      </div>
                    </div>

                    {/* Stock & Rate Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Volume</span>
                        <strong className="text-teal-700 font-semibold">
                          {(resource.availableQuantity || 0).toLocaleString()} {resource.unit}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Indicative Rate</span>
                        <strong className="text-slate-900 font-semibold">
                          ₹{resource.pricePerUnit || 0} / {resource.unit}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Condition</span>
                        <span className="font-medium">{resource.materialCondition}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hazard Status</span>
                        <span className={resource.compliance?.hazardousMaterial ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                          {resource.compliance?.hazardousMaterial ? 'Hazardous' : 'Non-hazardous'}
                        </span>
                      </div>
                    </div>

                    {/* Compatibility Factor Breakdown */}
                    {((matchItem.explanations && matchItem.explanations.length > 0) || (factors && factors.length > 0)) && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Matching Algorithm Insights
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {((matchItem.explanations && matchItem.explanations.length > 0)
                            ? matchItem.explanations
                            : factors.map((f) => (typeof f === 'string' ? f : `${f.name}: +${f.points} pts`))
                          ).map((itemStr, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded"
                            >
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              <span>{itemStr}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <Link
                        to={`/resources/${resource._id || resource.id}`}
                        className="text-slate-600 hover:text-navy-950 font-semibold transition-colors"
                      >
                        Inspect Full Technical Data →
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenProposal(resource)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Exchange Proposal</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Compatible Resources Found Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active listings currently meet the category or quantity criteria for this requirement. As soon as a supplier registers matching by-products, they will appear here.
              </p>
              <Link
                to="/marketplace"
                className="inline-block mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Browse Entire Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Submission Modal */}
      <RequestModal
        resource={selectedResourceForProposal}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          // Re-fetch matches to reflect updated unreserved quantities
          if (selectedRequirement) {
            const reqId = selectedRequirement._id || selectedRequirement.id;
            exchangeApi.get(`/api/matches/${reqId}`).then((res) => {
              setMatches(res.data?.data?.matches || []);
            });
          }
        }}
      />
    </div>
  );
};
