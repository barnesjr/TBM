import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

export default function ClientInfo() {
  const navigate = useNavigate();
  const { data, updateData } = useStore();
  if (!data) return null;
  const { client_info } = data;

  function update(field: keyof typeof client_info, value: string) {
    updateData((d) => {
      d.client_info[field] = value;
    });
  }

  return (
    <div className="max-w-2xl page-enter">
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        TBM Assessment — Client Information
      </h2>
      <p className="text-sm text-text-tertiary mb-8">
        Enter the details for this assessment engagement.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Client Name
          </label>
          <input
            type="text"
            value={client_info.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Department of Defense"
            className="w-full px-3 py-2 bg-surface-medium border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Industry
          </label>
          <input
            type="text"
            value={client_info.industry}
            onChange={(e) => update('industry', e.target.value)}
            placeholder="e.g. Federal Government"
            className="w-full px-3 py-2 bg-surface-medium border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Assessment Date
          </label>
          <input
            type="date"
            value={client_info.assessment_date}
            onChange={(e) => update('assessment_date', e.target.value)}
            className="w-full px-3 py-2 bg-surface-medium border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Assessor Name
          </label>
          <input
            type="text"
            value={client_info.assessor}
            onChange={(e) => update('assessor', e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full px-3 py-2 bg-surface-medium border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-8 px-6 py-2.5 bg-accent hover:bg-accent-bright text-white text-sm font-medium rounded-lg transition-colors duration-200"
      >
        Continue to Dashboard &rarr;
      </button>
    </div>
  );
}
