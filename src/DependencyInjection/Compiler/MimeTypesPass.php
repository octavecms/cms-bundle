<?php

namespace Octave\CMSBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Mime\MimeTypes;

class MimeTypesPass implements CompilerPassInterface
{
    /**
     * @param ContainerBuilder $container
     */
    public function process(ContainerBuilder $container)
    {
        $exts = $container->getParameter('octave.cms.media.file_types');

        $mimeTypeGuesser = new MimeTypes();

        $mimeTypes = [];

        foreach ($exts as $ext) {
            $mimeTypes = array_merge($mimeTypes, $mimeTypeGuesser->getMimeTypes($ext));
        }

        $container->setParameter('octave.cms.media.allowed_mime_types', $mimeTypes);
    }
}