<?php

namespace Octave\CMSBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class LiipImagineFilterSetsGenerator implements CompilerPassInterface
{
    /**
     * @inheritDoc
     */
    public function process(ContainerBuilder $container)
    {
        if ($container->hasParameter('liip_imagine.filter_sets')) {

            $liipFilterSets = $container->getParameter('liip_imagine.filter_sets');

            $resizeOptions = $container->getParameter('octave.cms.media.resize_options');

            $filterSets = [];
            $filterSetTemplate = [
                "quality" => 100,
                "jpeg_quality" => null,
                "png_compression_level" => null,
                "png_compression_filter" => null,
                "format" => null,
                "animated" => false,
                "cache" => null,
                "data_loader" => null,
                "default_image" => null,
                "filters" => [],
                "post_processors" => [],
            ];

            foreach ($resizeOptions as $name => $resizeOption) {
                foreach ($resizeOption as $sizeName => $sizeOptions) {

                    $filterSetOptions = $filterSetTemplate;

                    $relativeResize = [];

                    if (isset($sizeOptions['width'])) {
                        $relativeResize['widen'] = $sizeOptions['width'];
                    }

                    if (isset($sizeOptions['height'])) {
                        $relativeResize['heighten'] = $sizeOptions['height'];
                    }

                    $filterSetOptions['filters']['relative_resize'] = $relativeResize;

                    $filterSets[$name . '_' . $sizeName] = $filterSetOptions;
                }
            }

            $liipFilterSets = array_merge($liipFilterSets, $filterSets);

            $container->setParameter('liip_imagine.filter_sets', $liipFilterSets);
        }
    }
}