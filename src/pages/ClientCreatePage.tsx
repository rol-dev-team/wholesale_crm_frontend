import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { ClientAPI } from '@/api/clientApi';

export default function ClientCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    mobile_no: '',
    address: '',
    status: '',
    branch: '',
    assigned_kam: '',
    license_status: 'yes',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await ClientAPI.createLocalClient(form);
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>

          <div>
            <Label>Mobile No</Label>
            <Input value={form.mobile_no} onChange={(e) => handleChange('mobile_no', e.target.value)} />
          </div>

          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
          </div>

          {/* <div>
            <Label>Status</Label>
            <Input value={form.status} onChange={(e) => handleChange('status', e.target.value)} />
          </div>

          <div>
            <Label>Branch</Label>
            <Input value={form.branch} onChange={(e) => handleChange('branch', e.target.value)} />
          </div>

          <div>
            <Label>Assigned KAM</Label>
            <Input value={form.assigned_kam} onChange={(e) => handleChange('assigned_kam', e.target.value)} />
          </div> */}

          <div>
            <Label>License Status</Label>
            <Select
              value={form.license_status}
              onValueChange={(v) => handleChange('license_status', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Create Client'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

