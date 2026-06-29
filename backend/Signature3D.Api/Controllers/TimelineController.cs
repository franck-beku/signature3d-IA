using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize]
public class TimelineController : ControllerBase
{
    private readonly ITimelineService _timeline;

    public TimelineController(ITimelineService timeline) => _timeline = timeline;

    // GET /api/clients/{clientId}/timeline
    [HttpGet("{clientId:guid}/timeline")]
    public async Task<IActionResult> GetTimeline(Guid clientId)
    {
        var result = await _timeline.GetClientTimelineAsync(clientId);
        return result is null ? NotFound() : Ok(result);
    }
}
