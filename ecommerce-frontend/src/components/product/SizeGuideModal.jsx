import React, { useState } from 'react';
import Sheet from '../ui/Sheet.jsx';
import Button from '../ui/Button.jsx';

export default function SizeGuideModal({ isOpen, onClose, category = 'apparel' }) {
  const [unit, setUnit] = useState('cm'); // 'cm' | 'inches'
  const isFootwear = category?.toLowerCase().includes('footwear') || category?.toLowerCase().includes('shoes') || category?.toLowerCase().includes('sneakers');

  const apparelSizes = [
    { size: 'S', chestCm: '91-96', chestIn: '36-38', waistCm: '76-81', waistIn: '30-32', hipCm: '91-96', hipIn: '36-38' },
    { size: 'M', chestCm: '97-102', chestIn: '38-40', waistCm: '81-86', waistIn: '32-34', hipCm: '97-102', hipIn: '38-40' },
    { size: 'L', chestCm: '103-108', chestIn: '40-42', waistCm: '86-91', waistIn: '34-36', hipCm: '103-108', hipIn: '40-42' },
    { size: 'XL', chestCm: '109-114', chestIn: '42-44', waistCm: '91-96', waistIn: '36-38', hipCm: '109-114', hipIn: '42-44' },
    { size: 'XXL', chestCm: '115-120', chestIn: '44-46', waistCm: '97-102', waistIn: '38-40', hipCm: '115-120', hipIn: '44-46' },
  ];

  const footwearSizes = [
    { ind: 'UK 6', us: 'US 7', eu: 'EU 40', cm: '24.5', in: '9.6' },
    { ind: 'UK 7', us: 'US 8', eu: 'EU 41', cm: '25.4', in: '10.0' },
    { ind: 'UK 8', us: 'US 9', eu: 'EU 42', cm: '26.0', in: '10.2' },
    { ind: 'UK 9', us: 'US 10', eu: 'EU 43', cm: '27.0', in: '10.6' },
    { ind: 'UK 10', us: 'US 11', eu: 'EU 44', cm: '27.9', in: '11.0' },
    { ind: 'UK 11', us: 'US 12', eu: 'EU 45', cm: '28.6', in: '11.2' },
  ];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={isFootwear ? 'Footwear Size Chart' : 'Standard Sizing & Fit Guide'}
      description="All measurements refer to body size, not garment dimensions."
      footer={
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-ink">
        {/* Metric / Imperial Unit Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <span className="text-xs font-semibold text-muted">Measurement Unit:</span>
          <div className="flex items-center bg-canvas p-0.5 rounded-lg border border-line">
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                unit === 'cm'
                  ? 'bg-surface text-brand shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                unit === 'inches'
                  ? 'bg-surface text-brand shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto rounded-xl border border-line">
          {isFootwear ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas text-muted font-semibold uppercase text-[10px] tracking-wider border-b border-line">
                <tr>
                  <th className="py-2.5 px-3">India / UK</th>
                  <th className="py-2.5 px-3">US</th>
                  <th className="py-2.5 px-3">EU</th>
                  <th className="py-2.5 px-3">Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {footwearSizes.map((row) => (
                  <tr key={row.ind} className="hover:bg-canvas/50">
                    <td className="py-2.5 px-3 font-bold text-ink">{row.ind}</td>
                    <td className="py-2.5 px-3 text-muted">{row.us}</td>
                    <td className="py-2.5 px-3 text-muted">{row.eu}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {unit === 'cm' ? `${row.cm} cm` : `${row.in} in`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas text-muted font-semibold uppercase text-[10px] tracking-wider border-b border-line">
                <tr>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Chest ({unit})</th>
                  <th className="py-2.5 px-3">Waist ({unit})</th>
                  <th className="py-2.5 px-3">Hips ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {apparelSizes.map((row) => (
                  <tr key={row.size} className="hover:bg-canvas/50">
                    <td className="py-2.5 px-3 font-bold text-ink">{row.size}</td>
                    <td className="py-2.5 px-3 font-mono text-muted">
                      {unit === 'cm' ? row.chestCm : row.chestIn}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted">
                      {unit === 'cm' ? row.waistCm : row.waistIn}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted">
                      {unit === 'cm' ? row.hipCm : row.hipIn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Measuring Advice */}
        <div className="p-4 bg-canvas rounded-xl border border-line space-y-1.5">
          <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
            💡 How to measure correctly
          </h5>
          <p className="text-[11px] text-muted leading-relaxed">
            {isFootwear
              ? 'Stand on a flat surface with your heel against a wall. Measure the distance from the wall to your longest toe.'
              : 'Hold the tape firmly but not tightly. For chest, measure around the fullest part. If in between sizes, order the larger size for a relaxed drape.'}
          </p>
        </div>
      </div>
    </Sheet>
  );
}
