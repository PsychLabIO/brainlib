export interface SessionHeader {
    participantId: string;
    experimentId: string;
    startTime: string; // ISO 8601
    [key: string]: unknown
}

export type TrialRecord = Record<string, unknown>;

export class DataWriter {
    private readonly trials: TrialRecord[] = [];

    constructor(readonly header: SessionHeader) {}

    record(trial: TrialRecord): void {
        this.trials.push({ ...trial, _wallTime: Date.now() });
    }

    snapshot(): { header: SessionHeader; trials: readonly TrialRecord[] } {
        return { header: this.header, trials: [...this.trials] };
    }

    async save(endpoint: string): Promise<void> {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.snapshot()),
        });
        if (!res.ok) {
            throw new Error(`Failed to save data: ${res.status} ${res.statusText}`);
        }
    }
}