import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const ALL_APPLICATIONS_ID = 'All';

export function useApplicationFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedApplications = useMemo(
    () =>
      (searchParams.get('application') ?? '')
        .split(',')
        .filter(
          application => application && application !== ALL_APPLICATIONS_ID,
        ),
    [searchParams],
  );
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(
    () => new Set(selectedApplications),
  );

  useEffect(() => {
    setExpandedApplications(current => {
      const newlySelectedApplications = selectedApplications.filter(
        application => !current.has(application),
      );
      if (!newlySelectedApplications.length) {
        return current;
      }
      return new Set([...current, ...newlySelectedApplications]);
    });
  }, [selectedApplications]);

  const updateApplications = (applications: string[]) => {
    setSearchParams(currentParams => {
      const nextParams = new URLSearchParams(currentParams);
      if (applications.length) {
        nextParams.set('application', applications.join(','));
      } else {
        nextParams.delete('application');
      }
      return nextParams;
    });
    const previouslySelectedApplications = new Set(selectedApplications);
    const newlySelectedApplications = applications.filter(
      application => !previouslySelectedApplications.has(application),
    );
    if (newlySelectedApplications.length) {
      setExpandedApplications(current => {
        const next = new Set(current);
        newlySelectedApplications.forEach(application => next.add(application));
        return next;
      });
    }
  };

  const toggleApplication = useCallback((application: string) => {
    setExpandedApplications(current => {
      const next = new Set(current);
      if (!next.has(application)) {
        next.add(application);
      } else {
        next.delete(application);
      }
      return next;
    });
  }, []);

  return {
    selectedApplications,
    expandedApplications,
    updateApplications,
    toggleApplication,
  };
}
