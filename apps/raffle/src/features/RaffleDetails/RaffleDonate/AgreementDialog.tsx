import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  useBreakpoint
} from '@ergo-raffle/ui-kit';

import { useDonate } from '@/hooks';

import { Agreement } from './Agreement';

export const AgreementDialog = () => {
  const { isMobile } = useBreakpoint();
  const { agreementDialogOpen, setAgreementDialogOpen } = useDonate();
  return isMobile ? (
    <Sheet open={agreementDialogOpen} onOpenChange={setAgreementDialogOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Agreement</SheetTitle>
          <SheetDescription>
            By donating to this raffle, you agree to the terms and conditions of the raffle. Please
            read them carefully before proceeding.
          </SheetDescription>
        </SheetHeader>
        <Agreement />
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={agreementDialogOpen} onOpenChange={setAgreementDialogOpen}>
      <DialogContent className="min-w-[90vw] lg:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Agreement</DialogTitle>
          <DialogDescription>
            By donating to this raffle, you agree to the terms and conditions of the raffle. Please
            read them carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
        <Agreement />
      </DialogContent>
    </Dialog>
  );
};
