import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingDatePicker } from '@/components/ui/FloatingDatePicker';
import { SelectItem } from '@/components/ui/select';
import { PrismAPI } from '@/api';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

const user = getUserInfo();
const supervisorIds = user?.supervisor_ids || [];
const isAdmin = isSuperAdmin() || isManagement();
const isSup = isSupervisor();
const isKamUser = isKAM();

/* -------------------- TYPES -------------------- */
interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  editingActivity?: any;
  activityTypes: {
    value: number;
    label: string;
  }[];
  kams: {
    value: number;
    label: string;
  }[];
  userRole?: string;
  userId: number;
}

type ClientOption = {
  value: number;
  label: string;
};

/* -------------------- COMPONENT -------------------- */
export function ActivityModal({
  open,
  onClose,
  onSave,
  editingActivity,
  activityTypes = [],
  kams = [],
  userRole,
  userId,
}: ActivityModalProps) {
  const isSupervisor = ['supervisor', 'super_admin', 'boss'].includes(userRole || '');

  /* -------------------- FORM STATE -------------------- */
  const [formData, setFormData] = useState<{
    kam_id: number | null;
    client_id: number | null;
    activity_type_id: number | null;
    posted_by: number;
    title: string;
    description: string;
    meeting_location: string;
    activity_schedule: string;
    status: string;
  }>({
    kam_id: null,
    client_id: null,
    activity_type_id: null,
    posted_by: userId,
    title: '',
    description: '',
    meeting_location: '',
    activity_schedule: '',
    status: 'upcoming',
  });

  const isEditMode = Boolean(editingActivity);

  const navigate = useNavigate();

  const [clientsByKam, setClientsByKam] = useState<ClientOption[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSource, setClientSource] = useState<'active' | 'inactive' | 'organization'>(
    'active'
  ); // default active

  // Track if options are empty
  const hasKams = kams.length > 0;
  const hasActivityTypes = activityTypes.length > 0;

  /* -------------------- RESET FORM FOR NEW TASK -------------------- */
  useEffect(() => {
    if (open && !editingActivity) {
      // Reset for new task
      setFormData({
        kam_id: null,
        client_id: null,
        activity_type_id: null,
        posted_by: userId,
        title: '',
        description: '',
        meeting_location: '',
        activity_schedule: '',
        status: 'upcoming',
      });
      setClientsByKam([]);
    }
  }, [open, editingActivity, userId]);

  /* -------------------- FETCH CLIENTS FIRST -------------------- */
  // ✅ Step 1: When editing activity changes, fetch clients for that KAM
  useEffect(() => {
    if (!open || !editingActivity) return;

    const kamId = Number(editingActivity.kam_id);

    if (kamId) {
      setIsLoadingClients(true);
      PrismAPI.getKamWiseClients(kamId)
        .then((res) => {
          const options = (res.data || []).map((item: any) => ({
            value: item.party_id,
            label: item.client,
          }));
          setClientsByKam(options);
          setIsLoadingClients(false);
        })
        .catch((err) => {
          console.error('Failed to fetch clients', err);
          setClientsByKam([]);
          setIsLoadingClients(false);
        });
    } else {
      setClientsByKam([]);
      setIsLoadingClients(false);
    }
  }, [editingActivity?.id, open]);

  /* -------------------- PREFILL FORM AFTER CLIENTS ARE LOADED -------------------- */
  // ✅ Step 2: Only prefill AFTER clients are loaded (when clientsByKam changes)
  useEffect(() => {
    if (!open || !editingActivity || isLoadingClients) return;

    const kamId = Number(editingActivity.kam_id);
    const clientId = Number(editingActivity.client_id);
    const activityTypeId = Number(editingActivity.activity_type_id);

    // ✅ Only set form data AFTER clients are available
    setFormData({
      kam_id: kamId,
      client_id: clientId,
      activity_type_id: activityTypeId,
      posted_by: editingActivity.posted_by || userId,
      title: editingActivity.title || '',
      description: editingActivity.description || '',
      meeting_location: editingActivity.meeting_location || '',
      activity_schedule: editingActivity.activity_schedule
        ? new Date(editingActivity.activity_schedule).toISOString().slice(0, 16)
        : '',
      status: editingActivity.status || 'upcoming',
    });
  }, [clientsByKam, editingActivity?.id, open, isLoadingClients]);

  /* -------------------- HANDLE KAM CHANGE -------------------- */

  const fetchErpClientsByKam = async (kamId: number) => {
    setIsLoadingClients(true);

    try {
      const res = await PrismAPI.getKamWiseClients(kamId);

      const options = (res?.data || []).map((item: any) => ({
        value: item.party_id,
        label: item.client,
      }));

      setClientsByKam(options);
    } catch (error) {
      console.error('Failed to fetch ERP clients', error);
      setClientsByKam([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchLocalClients = async (kamId: number) => {
    setIsLoadingClients(true);

    try {
      const res = await PrismAPI.getLocalClientsByKAM([kamId]);
      console.log('Local clients fetched successfully:', res?.data);
      const options = (res?.data || []).map((item: any) => ({
        value: item.id, // or item.id
        label: item.name, // or item.name
      }));

      setClientsByKam(options);
    } catch (error) {
      console.error('Failed to fetch local clients', error);
      setClientsByKam([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchPrismClients = async (
    kamId: number,
    source: 'active' | 'inactive' | 'organization'
  ) => {
    setIsLoadingClients(true);

    try {
      const res = await PrismAPI.getClientsByStatusAndKam(source, kamId);

      const options = (res?.data || []).map((item: any) => ({
        value: item.id,
        label: item.client,
      }));

      setClientsByKam(options);
    } catch (error) {
      console.error('Failed to fetch prism clients', error);
      setClientsByKam([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const loadClientsByKamAndSource = (
    kamId: number,
    source: 'active' | 'inactive' | 'organization'
  ) => {
    if (!kamId) {
      setClientsByKam([]);
      return;
    }
    fetchPrismClients(kamId, source);
  };

  const handleKamChange = (value: string) => {
    const kamId = value ? Number(value) : null;

    setFormData((prev) => ({
      ...prev,
      kam_id: kamId,
      client_id: null,
    }));

    if (kamId) {
      loadClientsByKamAndSource(kamId, clientSource);
    } else {
      setClientsByKam([]);
    }
  };

  const handleClientSourceChange = (source: 'active' | 'inactive' | 'organization') => {
    setClientSource(source);

    setFormData((prev) => ({
      ...prev,
      client_id: null,
    }));

    if (formData.kam_id) {
      loadClientsByKamAndSource(formData.kam_id, source);
    }
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      ...(editingActivity && { id: editingActivity.id }),
    };

    onSave(payload);
  };

  /* -------------------- SHOW LOADING STATE IF OPTIONS ARE EMPTY -------------------- */
  if (open && (!hasKams || !hasActivityTypes)) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="space-y-4 py-4">
            {/* Show current values if editing */}
            {editingActivity && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">
                    Current KAM: {editingActivity.kam_name || `ID: ${editingActivity.kam_id}`}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Current Activity Type:{' '}
                    {editingActivity.activity_type_name ||
                      `ID: ${editingActivity.activity_type_id}`}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    // Allow saving with current values even if options aren't loaded
                    onSave({
                      ...formData,
                      id: editingActivity.id,
                    });
                  }}
                  className="w-full"
                >
                  Are You Sure You Want to Proceed
                </Button>
              </div>
            )}

            <Button type="button" variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingActivity ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editingActivity ? 'Update the task details below.' : 'Fill in the task details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* -------------------- KAM SELECTION -------------------- */}

          <FloatingSelect
            label="KAM *"
            value={formData.kam_id?.toString() || ''}
            // onValueChange={handleKamChange}
            placeholder=""
            onValueChange={(value) => {
              handleKamChange(value);
            }}
          >
            {kams.map((kam) => (
              <SelectItem key={kam.value} value={kam.value.toString()}>
                {kam.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          <div className="flex gap-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="clientSource"
                value="active"
                checked={clientSource === 'active'}
                disabled={isEditMode}
                onChange={() => handleClientSourceChange('active')}
              />
              <span>Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="clientSource"
                value="inactive"
                checked={clientSource === 'inactive'}
                disabled={isEditMode}
                onChange={() => handleClientSourceChange('inactive')}
              />
              <span>Inactive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="clientSource"
                value="organization"
                checked={clientSource === 'organization'}
                disabled={isEditMode}
                onChange={() => handleClientSourceChange('organization')}
              />
              <span>Organization</span>
            </label>
          </div>

          {/* -------------------- CLIENT SELECTION -------------------- */}
          <FloatingSelect
            label="Client *"
            value={formData.client_id?.toString() || ''}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                client_id: value ? Number(value) : null,
              }))
            }
            disabled={!formData.kam_id || isLoadingClients}
            placeholder={
              isLoadingClients
                ? '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Client Loading.......'
                : ''
            }
          >
            {clientsByKam.length > 0 ? (
              clientsByKam.map((client) => (
                <SelectItem key={client.value} value={client.value.toString()}>
                  {client.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-client" disabled>
                {isLoadingClients ? 'Loading clients...' : 'No clients available'}
              </SelectItem>
            )}
          </FloatingSelect>

          {/* -------------------- ACTIVITY TYPE -------------------- */}
          <FloatingSelect
            label="Activity Type *"
            value={formData.activity_type_id?.toString() || ''}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                activity_type_id: value ? Number(value) : null,
              }));
            }}
            placeholder=""
          >
            {activityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value.toString()}>
                {type.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* -------------------- TITLE -------------------- */}
          <FloatingInput
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />

          {/* -------------------- DESCRIPTION -------------------- */}
          <FloatingInput
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          {/* -------------------- SCHEDULE -------------------- */}
          <FloatingDatePicker
            label="Scheduled Date & Time"
            value={formData.activity_schedule}
            onChange={(value) => setFormData((prev) => ({ ...prev, activity_schedule: value }))}
          />

          {/* -------------------- MEETING LOCATION -------------------- */}
          {(formData.activity_type_id === 3 || formData.activity_type_id === 4) && (
            <FloatingInput
              label="Meeting Location"
              value={formData.meeting_location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meeting_location: e.target.value,
                }))
              }
            />
          )}

          {/* -------------------- ACTIONS -------------------- */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.kam_id ||
                !formData.client_id ||
                !formData.activity_type_id ||
                !formData.title.trim()
              }
            >
              {editingActivity ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
