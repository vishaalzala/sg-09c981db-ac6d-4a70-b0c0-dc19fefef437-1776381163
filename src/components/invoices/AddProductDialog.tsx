import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddProductDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (product: any) => void;
}

export function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState < any[] > ([]);
    const [selectedProduct, setSelectedProduct] = useState < any > (null);
    const [quantity, setQuantity] = useState(1);
    const [rate, setRate] = useState("");

    useEffect(() => {
        if (open) {
            loadProducts();
        }
    }, [open]);

    const loadProducts = async () => {
        const { data } = await supabase
            .from("inventory_items")
            .select("*")
            .order("description");
        setProducts(data || []);
    };

    const filteredProducts = products.filter(p =>
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.part_number || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        if (selectedProduct) {
            onAdd({
                description: selectedProduct.description,
                qty: quantity,
                rate: parseFloat(rate) || selectedProduct.sell_price || 0,
                total: quantity * (parseFloat(rate) || selectedProduct.sell_price || 0)
            });
            setSelectedProduct(null);
            setQuantity(1);
            setRate("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg">
                        <div className="p-2 space-y-1">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setRate(String(product.sell_price || 0));
                                    }}
                                    className={`w-full text-left p-3 rounded hover:bg-muted transition-colors ${selectedProduct?.id === product.id ? "bg-muted" : ""
                                        }`}
                                >
                                    <div className="font-medium">{product.description}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Part: {product.part_number || "—"} | ${Number(product.sell_price || 0).toFixed(2)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {selectedProduct && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rate</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={(quantity * (parseFloat(rate) || 0)).toFixed(2)}
                                    disabled
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="flex-1" disabled={!selectedProduct}>
                            Add Product
                        </Button>
                        <Button onClick={onClose} variant="outline" className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}