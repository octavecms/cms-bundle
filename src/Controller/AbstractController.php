<?php

namespace Octave\CMSBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
abstract class AbstractController extends Controller
{
    /**
     * @param \Exception $exception
     * @return JsonResponse
     */
    protected function generateJsonErrorResponse(\Exception $exception)
    {
        return new JsonResponse(
            [
                'status' => false,
                'message' => $exception->getMessage()
            ],
            500
        );
    }

    protected function warmUpRouteCache()
    {
        $router = $this->get('router');
        $filesystem = $this->get('filesystem');
        $kernel = $this->get('kernel');
        $cacheDir = $kernel->getCacheDir();

        foreach (array('matcher_cache_class', 'generator_cache_class') as $option) {
            $className = $router->getOption($option);
            $cacheFile = $cacheDir . DIRECTORY_SEPARATOR . $className . '.php';
            $filesystem->remove($cacheFile);
        }

        $router->warmUp($cacheDir);
    }
}