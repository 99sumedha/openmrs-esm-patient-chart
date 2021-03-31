import React from "react";
import dayjs from "dayjs";
import { getVisitsForPatient } from "./visit.resource";
import { getStartedVisit, VisitMode, VisitStatus } from "./visit-utils";

export function useVisit(patientUuid: string) {
  const [currentVisit, setCurrentVisit] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const abortController = new AbortController();
    const sub = getVisitsForPatient(patientUuid, abortController).subscribe(
      ({ data }) => {
        const currentVisit = data.results.find(
          (visit) =>
            dayjs(visit.startDatetime).format("DD-MM-YYYY") ===
            dayjs(new Date()).format("DD-MM-YYYY")
        );
        if (currentVisit) {
          getStartedVisit.next({
            mode: VisitMode.LOADING,
            visitData: currentVisit,
            status: VisitStatus.ONGOING,
          });
          setCurrentVisit(currentVisit);
        }
      },
      (error) => setError(error)
    );
    return () => sub && sub.unsubscribe();
  }, [patientUuid]);

  return { currentVisit: currentVisit, error: error };
}
