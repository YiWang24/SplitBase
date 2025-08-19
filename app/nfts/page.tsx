"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, Sparkles, Search, Filter } from "lucide-react";
import { NFTData } from "@/lib/nft-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NFTCard from "@/app/components/ui/nft-card";
import NFTDetailModal from "@/app/components/ui/nft-detail-modal";

import { useAccount } from "wagmi";

export default function NFTGalleryPage() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRarity, setFilterRarity] = useState<string>("all");

  // Fetch NFTs when component mounts or user connection changes
  useEffect(() => {
    fetchNFTs();
  }, [isConnected, address]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError("");

      // Only fetch NFTs if user is connected
      if (!isConnected || !address) {
        setNfts([]);
        setError("Please connect your wallet to view NFTs");
        return;
      }

      const response = await fetch(`/api/nft/list?userId=${address}`);
      const result = await response.json();

      if (result.success) {
        setNfts(result.data.nfts || []);
      } else {
        setError(result.error || "Failed to load NFTs");
      }
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError("Failed to load NFTs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNFTClick = (nft: NFTData) => {
    setSelectedNFT(nft);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNFT(null);
  };

  // Optimized filtering with useMemo
  const filteredNFTs = useMemo(() => {
    return nfts.filter((nft) => {
      const matchesSearch =
        searchTerm === "" ||
        nft.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.metadata.locationDisplayName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        nft.metadata.participants.some((p) =>
          p.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesRarity =
        filterRarity === "all" || nft.metadata.rarity === filterRarity;

      return matchesSearch && matchesRarity;
    });
  }, [nfts, searchTerm, filterRarity]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-soft-gradient p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading your NFT collection...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gradient p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-700">
                NFT Gallery
              </h1>
              <p className="text-neutral-500">
                Your collection of receipt NFTs
              </p>
            </div>
          </div>

          {/* Stats */}
          {nfts.length > 0 && (
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-primary">
                  {nfts.length}
                </p>
                <p className="text-sm text-neutral-500">Total NFTs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-secondary">
                  {nfts
                    .reduce((sum, nft) => sum + nft.metadata.totalAmount, 0)
                    .toFixed(0)}
                </p>
                <p className="text-sm text-neutral-500">Total USDC</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-accent">
                  {
                    new Set(nfts.flatMap((nft) => nft.metadata.participants))
                      .size
                  }
                </p>
                <p className="text-sm text-neutral-500">Unique Friends</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        {nfts.length > 0 && (
          <Card className="bg-white border-brand-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                </div>

                {/* Rarity Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-neutral-500" />
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="border border-neutral-200 rounded-lg px-3 py-2 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  >
                    <option value="all">All Rarities</option>
                    <option value="COMMON">Common</option>
                    <option value="RARE">Rare</option>
                    <option value="EPIC">Epic</option>
                    <option value="LEGENDARY">Legendary</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || filterRarity !== "all") && (
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-neutral-100">
                  <span className="text-sm text-neutral-500">
                    Active filters:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: &quot;{searchTerm}&quot;
                    </Badge>
                  )}
                  {filterRarity !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Rarity: {filterRarity}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterRarity("all");
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-error-light border-error-main/30">
            <CardContent className="p-6 text-center">
              <p className="text-error-dark">{error}</p>
              {/* Only show Try Again button if wallet is connected */}
              {isConnected && address && (
                <Button
                  onClick={fetchNFTs}
                  className="mt-4 bg-brand-gradient hover:bg-brand-gradient-dark text-white"
                >
                  Try Again
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && nfts.length === 0 && (
          <Card className="bg-white border-brand-primary/20">
            <CardContent className="p-12 text-center">
              {!isConnected ? (
                <>
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                    Please connect your wallet to view your NFT collection.
                  </p>
                  <Button
                    onClick={() => window.history.back()}
                    className="bg-brand-gradient hover:bg-brand-gradient-dark text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                    No NFTs Yet
                  </h3>
                  <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                    You haven&apos;t created any NFT receipts yet. Complete a
                    split and generate your first NFT to get started!
                  </p>
                  <Button
                    onClick={() => window.history.back()}
                    className="bg-brand-gradient hover:bg-brand-gradient-dark text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Create Your First NFT
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Results State */}
        {!loading && !error && nfts.length > 0 && filteredNFTs.length === 0 && (
          <Card className="bg-white border-brand-primary/20">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                No NFTs Found
              </h3>
              <p className="text-neutral-500 mb-4">
                No NFTs match your current search and filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterRarity("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* NFT List */}
        {!loading && !error && filteredNFTs.length > 0 && (
          <div className="space-y-4">
            {filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onClick={handleNFTClick}
                size="small"
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredNFTs.length > 0 && (
          <div className="text-center text-sm text-neutral-500">
            Showing {filteredNFTs.length} of {nfts.length} NFTs
          </div>
        )}
      </div>

      {/* NFT Detail Modal */}
      <NFTDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        nft={selectedNFT}
      />
    </div>
  );
}
