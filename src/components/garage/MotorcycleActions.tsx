
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, DollarSign, Trash } from 'lucide-react';
import { EditMotorcycleDialog } from './EditMotorcycleDialog';
import { SellMotorcycleDialog } from './SellMotorcycleDialog';

interface MotorcycleActionsProps {
  motorcycle: {
    id: string;
    make: string;
    model: string;
    year: number;
    nickname?: string;
  };
  serviceRecordsCount: number;
  onUpdate: () => void;
  onDelete: () => void;
}

export function MotorcycleActions({ motorcycle, serviceRecordsCount, onUpdate, onDelete }: MotorcycleActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSellDialog(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Sell Motorcycle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash className="h-4 w-4 mr-2" />
            Remove from Garage
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMotorcycleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        motorcycle={motorcycle}
        onSuccess={() => {
          onUpdate();
          setShowEditDialog(false);
        }}
      />

      <SellMotorcycleDialog
        open={showSellDialog}
        onOpenChange={setShowSellDialog}
        motorcycle={motorcycle}
        serviceRecordsCount={serviceRecordsCount}
        onSuccess={() => {
          onUpdate();
          setShowSellDialog(false);
        }}
      />
    </>
  );
}
