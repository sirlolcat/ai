/**
 * The AbortManager class manages the aborting of requests.
 * It holds an instance of AbortController and provides methods to start a new request,
 * abort the current request, and check if the current request should be aborted.
 */
class AbortManager {
    /** @private {AbortController|null} Holds the current AbortController instance or null if there is none */
    private abortController: AbortController | null = null;

    /**
     * Checks if the current request should be aborted.
     *
     * @returns {boolean} Returns true if there is no ongoing request (i.e., the abortController is null),
     *                    indicating that the current request should be aborted. Otherwise, returns false.
     */
    public shouldAbort(): boolean {
        return this.abortController === null;
    }

    /**
     * Starts a new request and returns its AbortSignal.
     * If there is an ongoing request, aborts it before starting a new one.
     *
     * @returns {AbortSignal} The AbortSignal of the new request.
     */
    public startNewRequest(): AbortSignal {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();
        return this.abortController.signal;
    }

    /**
     * Aborts the current request if there is one.
     */
    public abortRequest(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }
}

/**
 * An instance of AbortManager.
 * This is exported for use in managing aborts of requests elsewhere in the application.
 */
export const abortManager = new AbortManager();
