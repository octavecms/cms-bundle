<?php

namespace Octave\CMSBundle\Controller\Media;

use Sonata\AdminBundle\Controller\CRUDController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaController extends CRUDController
{
    /**
     * @return Response
     */
    public function listAction(Request $request): Response
    {
        $categories = $this->get('octave.cms.media_category.repository')->getTree();
        $currentCategory = $request->get('category', 'root');

        $selectMode = $request->get('select_mode');
        $template = '@OctaveCMS/Media/list.html.twig';
        if ($selectMode) $template = '@OctaveCMS/Media/list_raw.html.twig';

        return $this->render($template, [
            'current_category_id' => $currentCategory,
            'admin' => $this->admin,
            'root_category' => [
                'id' => 'root',
                'parent' => null,
                'name' => 'Default Category',
                'children' => $categories
            ],
            'uploadMaxSize' => $this->getMaxUploadSizeInBytes(),
        ]);
    }

    private function getMaxUploadSizeInBytes()
    {
        $postMaxSize = $this->sizeInBytes( ini_get('post_max_size') );
        $uploadMaxFilesize = $this->sizeInBytes( ini_get('upload_max_filesize') );

        return min($postMaxSize, $uploadMaxFilesize);
    }

    private function sizeInBytes(string $size)
    {
        $value = (int) $size;
        $unit = strtoupper(substr($size, -1));

        switch ($unit) {
            case 'K':
                $value *= 1024;
                break;
            case 'M':
                $value *= 1024 * 1024;
                break;
        }

        return $value;
    }
}
