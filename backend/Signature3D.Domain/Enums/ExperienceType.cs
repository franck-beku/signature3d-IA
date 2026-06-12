namespace Signature3D.Domain.Enums;

public enum ExperienceType
{
    Matterport,   // iframe Matterport (via MatterportId)
    Tour360,      // iframe 360° générique (Glo3D, Kuula, Pano2VR... via ExperienceUrl)
    IAOnly        // pas de visite immersive → chat Luxedia plein écran
}